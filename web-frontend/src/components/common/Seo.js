import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * Simple SEO helper wrapper around react-helmet.
 * Usage:
 *   <Seo title="Page Title" description="Description here" />
 * Will also inject basic Open-Graph / Twitter card tags for better sharing previews.
 */
const Seo = ({ title, description, lang = 'en', meta = [] }) => {
  const metaDescription = description || 'JamDung Jobs – Search and apply to jobs across Jamaica.';
  const defaultTitle = 'JamDung Jobs';

  return (
    <Helmet
      htmlAttributes={{ lang }}
      title={title || defaultTitle}
      titleTemplate={title ? `%s | ${defaultTitle}` : defaultTitle}
      meta={[
        {
          name: 'description',
          content: metaDescription
        },
        {
          property: 'og:title',
          content: title || defaultTitle
        },
        {
          property: 'og:description',
          content: metaDescription
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          name: 'twitter:title',
          content: title || defaultTitle
        },
        {
          name: 'twitter:description',
          content: metaDescription
        },
        ...meta
      ]}
    />
  );
};

export default Seo;
