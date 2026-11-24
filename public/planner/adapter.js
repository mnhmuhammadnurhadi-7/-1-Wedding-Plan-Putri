/* adapter.js
   Same window.claude contract as the supplied app, backed by this app's
   Next.js route handlers and MySQL. */
(function () {
  "use strict";

  var C = window.WP_CONFIG || {};
  var BASE = (C.API_BASE || "").replace(/\/+$/, "");
  var POLL = Math.max(2, +C.POLL_SECONDS || 6) * 1000;
  var PASS_KEY = "wp-edit-passcode";

  var clone = function (x) {
    return x == null ? x : JSON.parse(JSON.stringify(x));
  };
  var lsGet = function (k) {
    try {
      return localStorage.getItem(k);
    } catch (_) {
      return null;
    }
  };
  var lsSet = function (k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (_) {}
  };
  var passcode = function () {
    return lsGet(PASS_KEY) || "";
  };

  function apiError(status, message) {
    var error = new Error(message || "HTTP " + status);
    error.code = status === 401 || status === 403 ? "forbidden" : "http_" + status;
    return error;
  }

  function request(path, options) {
    options = options || {};
    var headers = Object.assign({ Accept: "application/json" }, options.headers || {});
    var code = passcode();
    if (code) {
      headers["x-wp-passcode"] = code;
    }

    var body = options.body;
    if (body && !(window.FormData && body instanceof window.FormData)) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    return fetch(BASE + path, {
      method: options.method || "GET",
      headers: headers,
      body: body,
      cache: "no-store",
    }).then(function (response) {
      return response.text().then(function (text) {
        var json = null;
        if (text) {
          try {
            json = JSON.parse(text);
          } catch (_) {
            json = null;
          }
        }
        if (!response.ok) {
          var message =
            (json && (json.error || json.message)) || text || "HTTP " + response.status;
          throw apiError(response.status, message);
        }
        return json;
      });
    });
  }

  var api = {
    readAll: function () {
      return request("/api/docs").then(function (json) {
        return (json && json.docs) || {};
      });
    },
    set: function (id, data) {
      return request("/api/docs/" + encodeURIComponent(id), {
        method: "POST",
        body: { data: data },
      });
    },
    merge: function (id, patch) {
      return request("/api/docs/" + encodeURIComponent(id), {
        method: "PATCH",
        body: { patch: patch },
      });
    },
    check: function () {
      return request("/api/auth").catch(function (error) {
        if (error && error.code === "forbidden") {
          return { required: true, ok: false };
        }
        throw error;
      });
    },
    upload: function (blob) {
      var type = blob.type || "application/octet-stream";
      var ext = (type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
      var name = blob.name || "upload-" + Date.now().toString(36) + "." + ext;
      var form = new FormData();
      form.append("file", blob, name);
      return request("/api/uploads", { method: "POST", body: form });
    },
  };

  var cache = {};
  var subs = {};
  var pending = 0;
  var firstDone = false;
  var firstPromise = null;
  var timer = null;
  var notified = {};

  function snap(id) {
    var row = cache[id];
    return {
      id: id,
      exists: !!row,
      data: function () {
        return row ? clone(row.data) : undefined;
      },
    };
  }

  function notify(id) {
    notified[id] = true;
    (subs[id] || []).slice().forEach(function (subscription) {
      try {
        subscription.cb(snap(id));
      } catch (error) {
        console.error(error);
      }
    });
  }

  function apply(all) {
    Object.keys(all || {}).forEach(function (id) {
      var row = all[id];
      if (!cache[id] || cache[id].updated_at !== row.updated_at) {
        cache[id] = row;
        notify(id);
      }
    });
    Object.keys(subs).forEach(function (id) {
      if (!cache[id] && !notified[id]) {
        notify(id);
      }
    });
  }

  function fail(error) {
    if (firstDone && Object.keys(cache).length) {
      return;
    }
    Object.keys(subs).forEach(function (id) {
      subs[id].forEach(function (subscription) {
        if (subscription.err) {
          subscription.err({
            code: "unavailable",
            message: String((error && error.message) || error),
          });
        }
      });
    });
  }

  function refresh() {
    if (pending > 0) {
      return Promise.resolve();
    }
    return api
      .readAll()
      .then(function (all) {
        if (pending === 0) {
          apply(all);
        }
        firstDone = true;
      })
      .catch(fail);
  }

  function start() {
    if (firstPromise) {
      return firstPromise;
    }
    firstPromise = refresh();
    timer = setInterval(function () {
      if (!document.hidden) {
        refresh();
      }
    }, POLL);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        refresh();
      }
    });
    window.addEventListener("online", refresh);
    return firstPromise;
  }

  function write(id, job) {
    pending++;
    return job()
      .then(function (row) {
        cache[id] = row;
        notify(id);
      })
      .then(
        function () {
          pending--;
        },
        function (error) {
          pending--;
          throw error;
        },
      );
  }

  var idOf = function (path) {
    return String(path).split("/").pop();
  };

  var db = {
    doc: function (path) {
      var id = idOf(path);
      return {
        get: function () {
          return start().then(function () {
            return snap(id);
          });
        },
        set: function (data) {
          return write(id, function () {
            return api.set(id, clone(data));
          });
        },
        update: function (patch) {
          return write(id, function () {
            return api.merge(id, clone(patch));
          });
        },
        onSnapshot: function (cb, errCb) {
          var subscription = { cb: cb, err: errCb };
          (subs[id] = subs[id] || []).push(subscription);
          start().then(function () {
            if (firstDone && !notified[id]) {
              notify(id);
            } else if (notified[id]) {
              try {
                cb(snap(id));
              } catch (error) {
                console.error(error);
              }
            }
          });
          return function () {
            subs[id] = (subs[id] || []).filter(function (item) {
              return item !== subscription;
            });
          };
        },
      };
    },
  };

  var canEdit = true;
  var userReady = api
    .check()
    .then(function (result) {
      canEdit = !!(result && result.ok);
      if (result && result.required) {
        renderEditBadge(canEdit);
      }
    })
    .catch(function () {
      canEdit = true;
    });

  function badge() {
    var existing = document.getElementById("wp-mode");
    if (existing) {
      return existing;
    }
    var button = document.createElement("button");
    button.id = "wp-mode";
    button.type = "button";
    button.style.cssText =
      "position:fixed;top:10px;right:10px;z-index:70;border:1px solid #EDE1D8;background:#fff;color:#8C5362;border-radius:999px;padding:6px 14px;font:600 12.5px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(140,83,98,.12)";
    document.body.appendChild(button);
    return button;
  }

  function renderEditBadge(ok) {
    var draw = function () {
      var button = badge();
      if (ok) {
        button.textContent = "Mode edit · Keluar";
        button.onclick = function () {
          lsSet(PASS_KEY, "");
          location.reload();
        };
      } else {
        button.textContent = "Hanya lihat · Masuk mode edit";
        button.onclick = function () {
          var value = prompt("Masukkan kode edit:");
          if (value == null) {
            return;
          }
          lsSet(PASS_KEY, value.trim());
          location.reload();
        };
      }
    };
    if (document.body) {
      draw();
    } else {
      document.addEventListener("DOMContentLoaded", draw);
    }
  }

  var user = {
    can: function (name) {
      return name === "data.write" ? canEdit : null;
    },
    canEdit: function () {
      return canEdit;
    },
    isOwner: function () {
      return canEdit;
    },
  };

  var downloads = {
    save: function (req) {
      return new Promise(function (resolve) {
        var blob =
          req.data instanceof Blob
            ? req.data
            : new Blob([req.data], {
                type: /\.json$/i.test(req.filename)
                  ? "application/json"
                  : "application/octet-stream",
              });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = req.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () {
          URL.revokeObjectURL(link.href);
        }, 4000);
        resolve({ status: "saved" });
      });
    },
  };

  var assets = {
    upload: function (blob) {
      return api.upload(blob);
    },
  };

  window.claude = {
    use: function (name) {
      switch (name) {
        case "db":
          return Promise.resolve(db);
        case "user":
          return userReady.then(function () {
            return user;
          });
        case "assets":
          return Promise.resolve(assets);
        case "downloads":
          return Promise.resolve(downloads);
        default:
          return Promise.resolve(null);
      }
    },
  };
})();
