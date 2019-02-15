require('dotenv').config()
const path = require('path')
const fetch = require('node-fetch');
const buildCmaResources = require('./src/utils/buildCmaResources');
const { parse, stringify } = require('flatted/cjs');
const camelcaseKeys = require('camelcase-keys');

module.exports = {
  siteMetadata: {
    siteUrl: `https://www.datocms.com`,
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        includePaths: [path.resolve(__dirname, "./src")]
      }
    },
    'gatsby-plugin-resolve-src',
    {
      resolve: `gatsby-source-datocms`,
      options: {
        apiToken: process.env.DATO_API_TOKEN,
        previewMode: process.env.PREVIEW_MODE,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/docs`,
        name: 'doc',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/legal`,
        name: 'legal',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-plugin-sharp`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-gemoji-to-emoji`,
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: 60,
            }
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 650,
              // Remove the default behavior of adding a link to each
              // image.
              linkImagesToOriginal: true,
              // Analyze images' pixel density to make decisions about
              // target image size. This is what GitHub is doing when
              // embedding images in tickets. This is a useful setting
              // for documentation pages with a lot of screenshots.
              // It can have unintended side effects on high pixel
              // density artworks.
              //
              // Example: A screenshot made on a retina screen with a
              // resolution of 144 (e.g. Macbook) and a width of 100px,
              // will be rendered at 50px.
              //
              // Defaults to false.
              sizeByPixelDensity: false,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              // Class prefix for <pre> tags containing syntax highlighting;
              // defaults to 'language-' (eg <pre class="language-js">).
              // If your site loads Prism into the browser at runtime,
              // (eg for use with libraries like react-live),
              // you may use this to prevent Prism from re-processing syntax.
              // This is an uncommon use-case though;
              // If you're unsure, it's best to use the default value.
              classPrefix: "language-",
            }
          },
          {
            resolve: 'gatsby-toc',
            options: {
              include: [
                'src/docs/plugins/sdk-reference.md' // an include glob to match against
              ],
              mdastUtilTocOptions: {
                heading: 'Table of Contents'
              }
            }
          }
        ],
      },
    },
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-netlify`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-22858312-5`,
        anonymize: true,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            query: `
              {
                entries: allDatoCmsChangelogEntry(sort: { fields: [publicationDate], order: DESC }, limit: 10) {
                  edges {
                    node {
                      title
                      slug
                      content: contentNode {
                        markdown: childMarkdownRemark {
                          excerpt(pruneLength: 100000)
                          html
                        }
                      }
                      publicationDate
                      categories {
                        name
                        color { hex }
                      }
                    }
                  }
                }
              }
            `,
            title: 'DatoCMS Product Changelog',
            description: 'Here we document our progress and announce product updates',
            setup: ({ title, description }) => {
              return { title, description };
            },
            serialize: ({ query: { site, entries } }) => {
              return entries.edges.map(({ node: entry }) => {
                return {
                  title: entry.title,
                  date: new Date(entry.publicationDate),
                  description: entry.content.markdown.excerpt,
                  url: `https://www.datocms.com/changelog/${entry.slug}/`,
                  guid: `https://www.datocms.com/changelog/${entry.slug}/`,
                  custom_elements: [{ "content:encoded": entry.content.markdown.html }],
                };
              });
            },
            output: "/product-changelog.xml",
          },

          {
            query: `
              {
                articles: allDatoCmsBlogPost(sort: { fields: [publicationDate], order: DESC }, limit: 10) {
                  edges {
                    node {
                      slug
                      title
                      coverImage {
                        url
                      }
                      publicationDate
                      author {
                        name
                        avatar {
                          url
                        }
                      }
                      excerpt: excerptNode {
                        markdown: childMarkdownRemark {
                          excerpt(pruneLength: 100000)
                        }
                      }
                      content {
                        ... on DatoCmsTypeform {
                          id
                          model { apiKey }
                          typeform
                        }
                        ... on DatoCmsText {
                          id
                          model { apiKey }
                          text: textNode {
                            markdown: childMarkdownRemark {
                              html
                            }
                          }
                        }
                        ... on DatoCmsImage {
                          id
                          model { apiKey }
                          image {
                            url
                          }
                        }
                        ... on DatoCmsQuote {
                          id
                          model { apiKey }
                          quote: quoteNode {
                            markdown: childMarkdownRemark {
                              html
                            }
                          }
                          author
                        }
                        ... on DatoCmsQuestionAnswer {
                          id
                          model { apiKey }
                          question: questionNode {
                            markdown: childMarkdownRemark {
                              html
                            }
                          }
                          answer: answerNode {
                            markdown: childMarkdownRemark {
                              html
                            }
                          }
                        }
                        ... on DatoCmsVideo {
                          id
                          model { apiKey }
                          video {
                            url
                            title
                            providerUid
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            title: 'DatoCMS Blog',
            description: 'Where we post product updates and publish articles on topics such as digital publishing, content strategy, and software development.',
            setup: ({ title, description }) => {
              return { title, description };
            },
            serialize: ({ query: { site, articles } }) => {
              return articles.edges.map(({ node: article }) => {
                return {
                  title: article.title,
                  date: new Date(article.publicationDate),
                  description: article.excerpt.markdown.excerpt,
                  url: `https://www.datocms.com/blog/${article.slug}/`,
                  guid: `https://www.datocms.com/blog/${article.slug}/`,
                  language: 'en',
                  custom_elements: [
                    {
                      "content:encoded": article.content.map((block) => {
                        if (block.model.apiKey === 'text') {
                          return block.text.markdown.html;
                        }

                        if (block.model.apiKey === 'quote') {
                          return block.quote.markdown.html;
                        }

                        if (block.model.apiKey === 'question_answer') {
                          return block.question.markdown.html + block.answer.markdown.html;
                        }

                        if (block.model.apiKey === 'image') {
                          return `<img src="${block.image.url}?w=900" />`;
                        }

                        if (block.model.apiKey === 'typeform') {
                          return '';
                        }
                      }).join("\n")
                    }
                  ],
                };
              });
            },
            output: "/blog.xml",
          }
        ],
      },
    },

    {
      resolve: `gatsby-source-json`,
      options: {
        resolve: (createNode, digest) => (
          buildCmaResources(fetch)
            .then(resources => stringify(resources))
            .then(blob => (
              createNode({
                id: 'CmaResources',
                children: [],
                parent: null,
                internal: {
                  type: 'CmaResources',
                  contentDigest: digest(blob),
                },
                body: blob,
              })
            ))
        ),
      },
    },

    {
      resolve: `gatsby-source-json`,
      options: {
        resolve: (createNode, digest) => (
          fetch(
            'https://account-api.datocms.com/plans',
            { headers: { 'Accept': 'application/json' } }
          )
            .then(res => res.json())
            .then(res => stringify(camelcaseKeys(res.data, { deep: true })))
            .then(blob => (
              createNode({
                id: 'Plans',
                children: [],
                parent: null,
                internal: {
                  type: 'Plans',
                  contentDigest: digest(blob),
                },
                body: blob,
              })
            ))
        ),
      },
    },

    {
      resolve: `gatsby-source-json`,
      options: {
        resolve: (createNode, digest) => (
          fetch('https://internal.datocms.com/introspection/field-filters')
            .then(res => res.text())
            .then(blob => (
              createNode({
                id: 'FieldFiltersIntrospection',
                children: [],
                parent: null,
                internal: {
                  type: 'FieldFiltersIntrospection',
                  contentDigest: digest(blob),
                },
                body: blob,
              })
            ))
        ),
      },
    },
  ],
};
