import sanitizeHtml from 'sanitize-html';

// Allowed HTML tags and attributes for Quill content
const sanitizeOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code'
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
    'p': ['class'],
    'span': ['class'],
    'code': ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedClasses: {
    'p': ['ql-align-center', 'ql-align-right', 'ql-align-justify'],
    'span': ['ql-size-small', 'ql-size-large', 'ql-size-huge'],
    'code': ['ql-syntax']
  },
  transformTags: {
    'a': (tagName, attribs) => {
      // Add security attributes to links
      return {
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      };
    }
  }
};

export const sanitizeQuillContent = (content) => {
  if (!content) return '';
  
  // First, sanitize the HTML content
  const sanitizedContent = sanitizeHtml(content, sanitizeOptions);
  
  // Additional security checks
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedContent;
  
  // Remove any script tags that might have slipped through
  const scripts = tempDiv.getElementsByTagName('script');
  while (scripts.length > 0) {
    scripts[0].parentNode.removeChild(scripts[0]);
  }
  
  // Remove any event handlers
  const elements = tempDiv.getElementsByTagName('*');
  for (let element of elements) {
    const attributes = element.attributes;
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attr = attributes[i];
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    }
  }
  
  return tempDiv.innerHTML;
};

// Helper function to validate Quill content length
export const validateQuillContentLength = (content, maxLength = 10000) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText;
  return textContent.length <= maxLength;
}; 