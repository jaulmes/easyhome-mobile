module.exports = function(api) {
  const isTest = api.env('test');
  api.cache(true);

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      !isTest && [
        'nativewind/babel',
        {
          // Add this if you're using a different name for your Tailwind CSS file
          // tailwindConfig: './tailwind.config.js',
        },
      ],
    ].filter(Boolean),
  };
};