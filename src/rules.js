// Plain-language explanations for the axe-core rules that fail most often on shop and booking sites.
// Each entry: a short title, what is wrong in everyday words, who it blocks, and the WCAG 2.1 criterion.
// Rules not listed here fall back to the description that axe-core itself provides.
'use strict';

const RULES = {
  'image-alt': {
    title: 'Images without a text alternative',
    plain: 'Some images have no alt text. A screen reader announces them as "image" or reads out the file name, so a blind visitor does not know what the picture shows, for example which product it is.',
    who: 'Blind and low-vision visitors using a screen reader.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'input-image-alt': {
    title: 'Image buttons without a text alternative',
    plain: 'A button made of an image has no alt text, so a screen reader cannot say what the button does.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'role-img-alt': {
    title: 'Elements marked as images without a name',
    plain: 'An element is marked as an image (role="img") but has no accessible name, so assistive technology announces nothing useful.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'svg-img-alt': {
    title: 'SVG images without a text alternative',
    plain: 'An SVG marked as an image has no title or label, so its meaning is lost for screen reader users.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'area-alt': {
    title: 'Image map areas without a text alternative',
    plain: 'Clickable areas of an image map have no alt text, so their destination cannot be announced.',
    who: 'Screen reader users.',
    wcag: '1.1.1 Non-text Content (Level A)',
  },
  'label': {
    title: 'Form fields without a label',
    plain: 'Some form fields have no label that assistive technology can read. A visitor hears "edit text" with no idea whether to type a name, an email or a card number. A placeholder alone is not a label: it disappears when typing starts.',
    who: 'Screen reader users, voice control users, and people with memory or attention difficulties.',
    wcag: '1.3.1 Info and Relationships and 4.1.2 Name, Role, Value (Level A)',
  },
  'select-name': {
    title: 'Drop-down lists without a label',
    plain: 'A drop-down list (for example size or country) has no label, so a screen reader cannot say what it is for.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'button-name': {
    title: 'Buttons without a name',
    plain: 'Some buttons have no text that assistive technology can read, often icon buttons such as a cart, a menu or a close cross. A screen reader just says "button".',
    who: 'Screen reader users and voice control users, who cannot say the name of a button that has none.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'input-button-name': {
    title: 'Input buttons without a name',
    plain: 'An input of type button, submit or reset has no value or label, so its action is not announced.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'link-name': {
    title: 'Links without a name',
    plain: 'Some links have no text that assistive technology can read, usually links that contain only an icon or an image. A screen reader announces "link" and nothing else, so the visitor cannot tell where it goes.',
    who: 'Screen reader users and voice control users.',
    wcag: '2.4.4 Link Purpose (In Context) and 4.1.2 Name, Role, Value (Level A)',
  },
  'color-contrast': {
    title: 'Text with too little contrast',
    plain: 'Some text is too light against its background. WCAG asks for a contrast ratio of at least 4.5 to 1 for normal text and 3 to 1 for large text. Below that, many people cannot read it, especially on a phone outdoors.',
    who: 'Low-vision visitors, older visitors, and anyone reading in bright light.',
    wcag: '1.4.3 Contrast (Minimum) (Level AA)',
  },
  'html-has-lang': {
    title: 'Page language not declared',
    plain: 'The page does not say which language it is written in. Screen readers then guess, and may read English text with a French or German voice, which is hard to understand.',
    who: 'Screen reader users.',
    wcag: '3.1.1 Language of Page (Level A)',
  },
  'html-lang-valid': {
    title: 'Page language code is not valid',
    plain: 'The page declares a language code that is not a valid code, so screen readers cannot use it.',
    who: 'Screen reader users.',
    wcag: '3.1.1 Language of Page (Level A)',
  },
  'valid-lang': {
    title: 'Invalid language code on part of the page',
    plain: 'A part of the page declares a language with a code that is not valid.',
    who: 'Screen reader users.',
    wcag: '3.1.2 Language of Parts (Level AA)',
  },
  'document-title': {
    title: 'Page without a title',
    plain: 'The page has no title. The title is the first thing a screen reader announces and the name shown in browser tabs and history.',
    who: 'Screen reader users and anyone with many tabs open.',
    wcag: '2.4.2 Page Titled (Level A)',
  },
  'meta-viewport': {
    title: 'Zoom is blocked on mobile',
    plain: 'The page tells phones not to let visitors zoom in (user-scalable=no or a low maximum-scale). People who need larger text cannot enlarge it.',
    who: 'Low-vision visitors on phones and tablets.',
    wcag: '1.4.4 Resize Text (Level AA)',
  },
  'meta-refresh': {
    title: 'Page refreshes or redirects on a timer',
    plain: 'The page reloads or moves to another address after a delay, which can interrupt someone who reads slowly or uses a screen reader.',
    who: 'Screen reader users and people who need more time to read.',
    wcag: '2.2.1 Timing Adjustable (Level A)',
  },
  'frame-title': {
    title: 'Embedded frames without a title',
    plain: 'An embedded frame (a video, a map, a payment or chat widget) has no title, so a screen reader cannot say what it contains before entering it.',
    who: 'Screen reader users.',
    wcag: '2.4.1 Bypass Blocks and 4.1.2 Name, Role, Value (Level A)',
  },
  'aria-required-attr': {
    title: 'ARIA roles missing a required attribute',
    plain: 'An element uses an ARIA role but lacks an attribute that role needs (for example a checkbox role without aria-checked), so its state is not announced.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-valid-attr-value': {
    title: 'ARIA attributes with invalid values',
    plain: 'An ARIA attribute has a value that is not allowed, or points to an element that does not exist, so assistive technology ignores it or reports something wrong.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-valid-attr': {
    title: 'Misspelled or unknown ARIA attributes',
    plain: 'An attribute starting with aria- does not exist (often a typo), so it has no effect.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-allowed-attr': {
    title: 'ARIA attributes not allowed on this element',
    plain: 'An element carries an ARIA attribute that its role does not support, which can confuse assistive technology.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-prohibited-attr': {
    title: 'ARIA attributes that are not allowed here',
    plain: 'An element uses an ARIA attribute (often aria-label on a plain div or span) that is prohibited for its role, so many screen readers ignore it.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-hidden-focus': {
    title: 'Hidden content that can still receive focus',
    plain: 'Content is hidden from assistive technology (aria-hidden="true") but still contains links or buttons reachable with the Tab key. Keyboard users land on something a screen reader says nothing about.',
    who: 'Keyboard and screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-input-field-name': {
    title: 'Custom input fields without a name',
    plain: 'A custom input built with ARIA (for example a combobox or a slider) has no accessible name.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-command-name': {
    title: 'Custom buttons or links without a name',
    plain: 'An element with a button, link or menu item role has no accessible name.',
    who: 'Screen reader and voice control users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-roles': {
    title: 'Invalid ARIA roles',
    plain: 'An element uses a role value that does not exist, so assistive technology cannot tell what it is.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'aria-required-children': {
    title: 'ARIA containers missing their required children',
    plain: 'A container role such as a list, menu or tab list does not contain the child roles it needs, so its structure is not announced.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'aria-required-parent': {
    title: 'ARIA items outside their required container',
    plain: 'An item role such as a list item, menu item or tab is not inside the container it belongs to.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'list': {
    title: 'Lists that contain other elements',
    plain: 'A list (ul or ol) directly contains elements that are not list items, so screen readers may count or announce it wrongly.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'listitem': {
    title: 'List items outside a list',
    plain: 'A list item (li) is not inside a ul or ol, so it is not announced as part of a list.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'definition-list': {
    title: 'Badly built definition lists',
    plain: 'A definition list (dl) contains elements other than dt and dd groups.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'dlitem': {
    title: 'Definition terms outside a definition list',
    plain: 'A dt or dd element is not inside a dl.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'nested-interactive': {
    title: 'Interactive elements inside other interactive elements',
    plain: 'A button or link contains another button or link. Screen readers may not announce the inner one, and keyboard focus behaves unpredictably.',
    who: 'Keyboard and screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'link-in-text-block': {
    title: 'Links that only differ by colour',
    plain: 'A link inside a paragraph is distinguished from the text around it by colour alone, without underline or enough contrast with the text.',
    who: 'Visitors with colour vision deficiency or low vision.',
    wcag: '1.4.1 Use of Color (Level A)',
  },
  'autocomplete-valid': {
    title: 'Wrong autocomplete values',
    plain: 'A form field uses an autocomplete value that does not exist, so browsers and assistive tools cannot fill it in or identify its purpose.',
    who: 'People with motor or cognitive disabilities who rely on autofill.',
    wcag: '1.3.5 Identify Input Purpose (Level AA)',
  },
  'td-headers-attr': {
    title: 'Table cells pointing to missing headers',
    plain: 'Table cells refer to header cells that are not in the same table.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'th-has-data-cells': {
    title: 'Table headers that describe nothing',
    plain: 'A table header cell does not describe any data cell.',
    who: 'Screen reader users.',
    wcag: '1.3.1 Info and Relationships (Level A)',
  },
  'duplicate-id-aria': {
    title: 'Duplicate IDs used by labels or ARIA',
    plain: 'Two elements share an ID that a label or ARIA attribute points to, so the wrong element may be announced.',
    who: 'Screen reader users.',
    wcag: '4.1.2 Name, Role, Value (Level A)',
  },
  'scrollable-region-focusable': {
    title: 'Scrollable areas the keyboard cannot reach',
    plain: 'A scrollable area cannot receive keyboard focus, so people who do not use a mouse cannot scroll it.',
    who: 'Keyboard users.',
    wcag: '2.1.1 Keyboard (Level A)',
  },
  'frame-focusable-content': {
    title: 'Frames with focusable content removed from the tab order',
    plain: 'A frame has tabindex="-1" but contains links or buttons, so keyboard users cannot reach them.',
    who: 'Keyboard users.',
    wcag: '2.1.1 Keyboard (Level A)',
  },
  'video-caption': {
    title: 'Videos without captions',
    plain: 'A video has no captions track, so deaf and hard-of-hearing visitors miss what is said.',
    who: 'Deaf and hard-of-hearing visitors.',
    wcag: '1.2.2 Captions (Prerecorded) (Level A)',
  },
  'bypass': {
    title: 'No way to skip repeated content',
    plain: 'There is no skip link, heading or landmark that lets keyboard users jump past the navigation to the main content.',
    who: 'Keyboard and screen reader users.',
    wcag: '2.4.1 Bypass Blocks (Level A)',
  },
  'server-side-image-map': {
    title: 'Server-side image maps',
    plain: 'A server-side image map can only be used with a mouse.',
    who: 'Keyboard users.',
    wcag: '2.1.1 Keyboard (Level A)',
  },
  'avoid-inline-spacing': {
    title: 'Text spacing locked by inline styles',
    plain: 'Inline styles with !important prevent visitors from increasing letter, word or line spacing.',
    who: 'Visitors with dyslexia or low vision who adjust text spacing.',
    wcag: '1.4.12 Text Spacing (Level AA)',
  },
};

const IMPACT_ORDER = { critical: 4, serious: 3, moderate: 2, minor: 1 };

function explain(violation) {
  const known = RULES[violation.id];
  if (known) return { id: violation.id, ...known };
  return {
    id: violation.id,
    title: violation.help || violation.id,
    plain: violation.description || '',
    who: 'People using assistive technology.',
    wcag: (violation.tags || []).filter((t) => /^wcag\d{3,4}$/.test(t)).map((t) => { const d = t.slice(4); return `${d[0]}.${d[1]}.${d.slice(2)}`; }).join(', ') || 'WCAG 2.1',
  };
}

module.exports = { RULES, IMPACT_ORDER, explain };
