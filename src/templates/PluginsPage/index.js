import React from 'react'
import Link from 'gatsby-link'
import { Wrap, button, Space, text } from 'blocks'
import { HelmetDatoCms } from 'gatsby-source-datocms'
import Img from 'gatsby-image'
import sortBy from 'sort-by'
import slugify from 'slugify';

import bem from 'utils/bem'
import gravatar from 'utils/gravatar'
import './style.sass'

import PluginsAside from 'components/PluginsAside'

const b = bem.lock('PluginsPage')

const toPath = function(pluginType, fieldType) {
  let path = '/plugins/';

  if (pluginType) {
    path += pluginType + '/';
  }

  if (fieldType) {
    path += fieldType + '/';
  }

  return path;
}

export default class PluginsPage extends React.Component {
  render() {
    const plugins = this.props.pathContext.group.map(({ node }) => node);
    const pluginTypes = [{ code: null, name: 'All plugin types' }].concat(this.props.data.pluginTypes.edges.map(({ node }) => node));
    const fieldTypes = [{ code: null, name: 'All field types' }].concat(this.props.data.fieldTypes.edges.map(({ node }) => node));

    const {
      pageCount,
      first,
      last,
      index,
      additionalContext: {
        pluginType,
        fieldType,
        combosWithResults,
      },
    } = this.props.pathContext;

    const pluginTypeCats = pluginTypes
      .filter(({ code, name }) => {
        const path = toPath(code, fieldType);
        return !!combosWithResults[path];
      })
      .map(({ code, name }) => {
        const path = toPath(code, fieldType);

        return (
          <li key={path}>
            <Link to={path} exact activeClassName="active">
              {name} <span>({combosWithResults[path].plugins.length})</span>
            </Link>
          </li>
        );
      });

    const fieldTypeCats = fieldTypes
      .filter(({ code, name }) => {
        const path = toPath(pluginType, code);
        return !!combosWithResults[path];
      })
      .map(({ code, name }) => {
        const path = toPath(pluginType, code);

        return (
          <li key={path}>
            <Link exact to={path} activeClassName="active">
              {name} <span>({combosWithResults[path].plugins.length})</span>
            </Link>
          </li>
        );
      });

    return (
      <Space both={10}>
        <div className={b()}>
          <Wrap>
            <HelmetDatoCms seo={this.props.data.page.seoMetaTags} />
            <div className={b('title')}>
              Plugins
            </div>
            <div className={b('subtitle')}>
              Extend the functionality of DatoCMS
            </div>
            <div className={b('content')}>
              <div className={b('sidebar')}>
                <div className={b('cats')}>
                  <div className={b('cats__title')}>
                    By plugin type
                  </div>
                  <ul>
                    {pluginTypeCats}
                  </ul>
                </div>
                <div className={b('cats')}>
                  <div className={b('cats__title')}>
                    By field type
                  </div>
                  <ul>
                    {fieldTypeCats}
                  </ul>
                </div>
              </div>
              <div className={b('body')}>
                <div className={b('plugins')}>
                  {
                    plugins.map((plugin) => (
                      <Link to={`/plugins/i/${slugify(plugin.packageName)}/`} key={plugin.name} className={b('plugin')}>
                        <div
                          className={b('plugin-image')}
                        >
                          {
                            plugin.coverImage && plugin.coverImage.format !== 'svg' &&
                              <Img sizes={plugin.coverImage.sizes} />
                          }
                          {
                            plugin.coverImage && plugin.coverImage.format === 'svg' &&
                              <div className="gatsby-image-wrapper">
                                <div className="svg" style={{ backgroundImage: `url(${plugin.coverImage.url})` }} />
                              </div>
                          }
                          <img
                            className={b('plugin-author-image')}
                            src={gravatar(plugin.author.email, { s: 80, d: 'retro' })}
                          />
                        </div>
                        <div className={b('plugin-body')}>
                          <h3 className={b('plugin-title')}>
                            {plugin.title}
                          </h3>
                          <div className={b('plugin-author')}>
                            v{plugin.version} by {plugin.author.name}
                          </div>
                          <div className={b('plugin-excerpt')}>
                            {plugin.description}
                          </div>
                        </div>
                      </Link>
                    ))
                  }
                </div>
                {
                  !first &&
                    <Link to={index === 2 ? '/plugins/' : `/plugins/${index-1}/`} className={b('previous')}>
                      See next plugins &raquo;
                    </Link>
                }
                {
                  !last &&
                    <Link to={`/plugins/${index+1}/`} className={b('previous')}>
                      &laquo; See previous plugins
                    </Link>
                }
              </div>
            </div>
          </Wrap>
        </div>
      </Space>
    );
  }
}

export const query = graphql`
query PluginsPageQuery {
  page: datoCmsPluginsPage {
    seoMetaTags {
      ...GatsbyDatoCmsSeoMetaTags
    }
  }
  pluginTypes: allDatoCmsPluginType(sort: {fields: [name], order: ASC}) {
    edges {
      node {
        name
        code
      }
    }
  }
  fieldTypes: allDatoCmsPluginFieldType(sort: {fields: [name], order: ASC}) {
    edges {
      node {
        name
        code
      }
    }
  }
}
`
