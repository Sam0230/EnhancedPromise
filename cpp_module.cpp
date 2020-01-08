#include <node_api.h>
#include <uv.h>

napi_value runloop(napi_env env, napi_callback_info info) {
    size_t argc = 4;
    napi_value args[4];
    char *detach_required = nullptr, *reached_timeout = nullptr, *pending = nullptr;
    uv_loop_t* event_loop = nullptr;
    napi_get_uv_event_loop(env, &event_loop);
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    napi_get_buffer_info(env, args[0], (void **) &detach_required, nullptr);
    napi_get_buffer_info(env, args[1], (void **) &reached_timeout, nullptr);
    napi_get_buffer_info(env, args[2], (void **) &pending, nullptr);
    while (detach_required[0] == '0' && reached_timeout[0] == '0' && pending[0] == '1' && uv_loop_alive(event_loop)) {
        napi_call_function(env, nullptr, args[3], 0, nullptr, nullptr); // Run next tick
        uv_run(event_loop, UV_RUN_ONCE);
    }
    return nullptr;
}
napi_value init(napi_env env, napi_value exports) {
    if (napi_create_function(env, nullptr, 0, runloop, nullptr, &exports) != napi_ok) {
        return nullptr;
    }
    return exports;
}
NAPI_MODULE(EnhancedPromiseCPPModule, init)
