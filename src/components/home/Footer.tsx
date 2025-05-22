
import { Link } from "react-router-dom";

const FooterColumn = ({ title, links }: { title: string, links: { text: string, href: string }[] }) => (
  <div>
    <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
    <ul className="space-y-2">
      {links.map((link, index) => (
        <li key={index}>
          {link.href.startsWith('/') ? (
            <Link 
              to={link.href} 
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              {link.text}
            </Link>
          ) : (
            <a 
              href={link.href} 
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              {link.text}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const productLinks = [
    { text: "Features", href: "#" },
    { text: "Templates", href: "#" },
    { text: "Pricing", href: "#pricing" }
  ];
  
  const supportLinks = [
    { text: "Help Center", href: "#" },
    { text: "Contact Us", href: "#" },
    { text: "Status", href: "#" }
  ];
  
  const legalLinks = [
    { text: "Terms of Service", href: "/terms-of-service" },
    { text: "Privacy Policy", href: "/privacy-policy" },
    { text: "Cookie Policy", href: "/cookie-policy" }
  ];

  return (
    <footer className="py-12 bg-[#121212]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-xl font-medium tracking-tight text-white">SOP</span>
              <span className="text-xl font-light tracking-tight text-[#007AFF]">ify</span>
            </div>
            <p className="text-sm text-zinc-500">Create beautiful SOPs in minutes.</p>
          </div>
          
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Support" links={supportLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>
        
        <div className="border-t border-zinc-800 pt-8 text-center">
          <p className="text-sm text-zinc-500">© 2025 SOPify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
