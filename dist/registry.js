var provider = [];
function addProvider(name, ctor) {
    provider[name] = ctor;
}
exports.addProvider = addProvider;
function create(name, options) {
    if (!provider[name]) {
        throw new Error('Provider with name: ' + name + ' could not be found, did you forget to include the source?');
    }
    var ctor = provider[name];
    // TODO whats this?
    return ctor.call(ctor, options);
}
exports.create = create;
function getProvider() {
    return provider;
}
exports.getProvider = getProvider;
//# sourceMappingURL=registry.js.map