module.exports = function(api) {
  const isTest = api.env('test');

  const presets = ['module:@react-native/babel-preset'];
  const plugins = [];

  if (!isTest) {
    plugins.push('nativewind/babel');
  }

  return {
    presets,
    plugins,
  };
};
