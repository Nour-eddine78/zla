import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-secondary shadow-inner py-4 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-300">© 2025 OCP - Office Chérifien des Phosphates. Tous droits réservés.</p>
          </div>
          <div className="flex space-x-4">
            <Link href="#">
              <a className="text-gray-500 dark:text-gray-400 hover:text-primary">Assistance</a>
            </Link>
            <Link href="#">
              <a className="text-gray-500 dark:text-gray-400 hover:text-primary">Documentation</a>
            </Link>
            <Link href="#">
              <a className="text-gray-500 dark:text-gray-400 hover:text-primary">Politique de confidentialité</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
