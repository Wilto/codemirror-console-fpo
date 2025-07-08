module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./codemirror-console-ui");
  eleventyConfig.addPassthroughCopy("_src/console.js");

  return {
    templateFormats: [
      "md"
    ],

    pathPrefix: "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: "_src",
      includes: "_templates",
      data: "_data",
      output: "_site"
    }
  };
};
