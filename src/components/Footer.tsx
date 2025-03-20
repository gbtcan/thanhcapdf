import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import LogoIcon from './LogoIcon';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    resources: [
      { name: 'Browse Hymns', href: '/hymns' },
      { name: 'Categories', href: '/categories' },
      { name: 'Authors', href: '/authors' },
      { name: 'Sheet Music', href: '/sheet-music' },
    ],
    community: [
      { name: 'Forum', href: '/forum' },
      { name: 'Contribute', href: '/contribute' },
      { name: 'Contact Us', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Copyright', href: '/copyright' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <LogoIcon className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 font-bold text-xl text-gray-900 dark:text-white">
                Catholic Hymns
              </span>
            </Link>
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
              Access and share Catholic hymns, sheet music, and more to enhance your liturgical celebration.
            </p>
            <div className="mt-6">
              <a
                href="mailto:contact@catholichymns.org"
                className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                <Mail className="h-5 w-5 mr-2" />
                <span>contact@catholichymns.org</span>
              </a>
            </div>
          </div>

          {/* Footer navigation */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Resources
              </h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Community
              </h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Social links and copyright */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
          <div className="flex space-x-6">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
                >
                  <span className="sr-only">{link.name}</span>
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>

          <div className="mt-6 md:mt-0 text-gray-500 dark:text-gray-400 text-sm">
            &copy; {currentYear} Catholic Hymns Library. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
