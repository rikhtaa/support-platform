export const INTEGRATIONS = [
    {
        id: "html",
        title: "HTML",
        icon: "/languages/html5.svg"
    },
    {
        id: "react",
        title: "React",
        icon: "/languages/react.svg"
    },
    {
        id: "next.js",
        title: "Next.js",
        icon: "/languages/nextjs.svg"
    },
    {
        id: "javascript",
        title: "JavaScript",
        icon: "/languages/javascript.svg"
    },
    {
        id: "wordpress",
        title: "WordPress",
        icon: "/languages/wordpress.png"
    },
] as const
export type IntegrationId = (typeof INTEGRATIONS)[number]["id"]

export const HTML_SCRIPT = `<script src="https://support-platform-widget-lime.vercel.app/widget.js"
data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const REACT_SCRIPT = `<script src="https://support-platform-widget-lime.vercel.app/widget.js"
data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const NEXTJS_SCRIPT = `<Script
  src="https://support-platform-widget-lime.vercel.app/widget.js"
  data-organization-id="{{ORGANIZATION_ID}}"
  strategy="afterInteractive"
/>`;
export const JAVASCRIPT_SCRIPT = `<script src="https://support-platform-widget-lime.vercel.app/widget.js"
data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const WORDPRESS_SCRIPT = `<script src="https://support-platform-widget-lime.vercel.app/widget.js"
data-organization-id="{{ORGANIZATION_ID}}"></script>`;

export const INTEGRATION_STEPS: Record<IntegrationId, string[]> = {
    html: [
        "Paste the code above into your page, right before the closing </body> tag."
    ],
    react: [
        "Open your project's public/index.html file (this is the actual HTML page your React app mounts into).",
        "Paste the code above right before the closing </body> tag.",
        "Save the file — no rebuild needed in dev mode, the chatbot button will appear on refresh."
    ],
    "next.js": [
        "Open app/layout.tsx (your root layout file).",
        "Add this import at the top: import Script from \"next/script\"",
        "Paste the <Script /> tag above anywhere inside your <body>, alongside your existing children.",
        "Example: export default function RootLayout({ children }) { return (<html><body>{children}<Script src=\"...\" data-organization-id=\"...\" strategy=\"afterInteractive\" /></body></html>) }"
    ],
    javascript: [
        "Paste the code above into your page, right before the closing </body> tag."
    ],
    wordpress: [
        "Install the free \"WPCode\" plugin: Plugins → Add New → search \"WPCode\" → Install → Activate.",
        "Go to Code Snippets → Header & Footer.",
        "Paste the code above into the Footer box.",
        "Click Save Changes — the chatbot will now appear on every page of your site."
    ]
}