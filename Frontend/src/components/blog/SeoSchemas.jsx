// src/components/blog/SeoSchemas.jsx

export function ArticleSchema({ post, author }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.summary,
    image: [`https://yourdomain.com${post.featuredImage}`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": post.canonicalUrl || `https://yourdomain.com/blog/${post.slug}`,
    },
    author: {
      "@type": "Person",
      name: author.name,
      url: `https://yourdomain.com/author/${author.slug}`,
      jobTitle: author.jobTitle,
    },
    publisher: {
      "@type": "Organization",
      name: "کافه هوش",
      logo: {
        "@type": "ImageObject",
        url: "https://yourdomain.com/images/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

export function BreadcrumbSchema({ items }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://yourdomain.com${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

export function FaqSchema({ faqItems }) {
  if (!faqItems || faqItems.length === 0) return null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

export function PersonSchema({ author }) {
  const sameAsLinks = author.socialLinks
    ? Object.values(author.socialLinks)
    : [];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://yourdomain.com/author/${author.slug}`,
    image: `https://yourdomain.com${author.avatarUrl}`,
    jobTitle: author.jobTitle,
    description: author.bio,
    sameAs: sameAsLinks,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
