// App.tsx - სრულფასოვანი React SPA ერთ ფაილში

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  ReactNode,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import ReactDOM from "react-dom/client"; // დამატებულია ReactDOM

// =============================================================================
// 1. ტიპები (Types)
// =============================================================================

type Theme = "light" | "dark";
type Language = "en" | "ka"; // English, Georgian

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// =============================================================================
// 2. API სერვისი (Axios Instance)
// =============================================================================

const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com", // მაგალითი API
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================================================================
// 3. Custom Hooks
// =============================================================================

// useLocalStorage Hook - მონაცემების Local Storage-ში შესანახად
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from local storage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error writing to local storage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// ThemeContext and useTheme Hook - თემების სამართავად
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>("appTheme", "light");
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// LanguageContext and useLanguage Hook - მრავალენოვანი მხარდაჭერისთვის
interface Translations {
  [key: string]: any;
}

const enTranslations: Translations = {
  home: {
    title: "Welcome to our SPA",
    description:
      "this is a simple React application that performs various functions",
    fetchPosts: "Click to load the post",
    loading: "Loading posts...",
    error: "Error fetching posts:",
    noPosts: "No posts found.",
  },
  about: {
    title: "About Us",
    description:
      "Learn more about our company and our activities. Our goal is to provide high-quality solutions to our customers..",
    fetchUsers: "Fetch Example Users",
    loading: "Loading users...",
    error: "Error fetching users:",
    noUsers: "No users found.",
  },
  contact: {
    title: "Contact Us",
    formName: "Your Name",
    formEmail: "Your Email",
    formMessage: "Your Message",
    submitButton: "Send Message",
    success: "Message sent successfully!",
    error: "Failed to send message.",
  },
  header: {
    home: "Home",
    about: "About",
    contact: "Contact",
    toggleTheme: "Toggle Theme",
    toggleLang: "Switch Language",
    georgian: "Georgian",
    english: "English",
  },
  footer: {
    copyright: "© 2025 My React SPA. All rights reserved.",
  },
  notFound: {
    title: "404 - Page Not Found",
    description: "The page you are looking for does not exist.",
    goHome: "Go to Home Page",
  },
};

const kaTranslations: Translations = {
  home: {
    title: "მოგესალმებით ჩვენს SPA -ის  აპლიკაციაში", // Updated
    description:
      "ეს არის მარტივი React აპლიკაცია, რომელიც სხვადასხვა ფუნქციონალს ასრულებს.", // Updated
    fetchPosts: "პოსტის ჩატვირთვისთვის დაჭირე ", // Updated
    loading: "პოსტი იტვირთება...",
    error: "პოსტის ჩამოტვირთვისას მოხდა შეცდომა:",
    noPosts: "პოსტი ვერ მოიძებნა.",
  },
  about: {
    title: "ჩვენს შესახებ",
    description:
      "გაიგეთ მეტი ჩვენი კომპანიის და საქმიანობის შესახებ. ჩვენი მიზანია მაღალი ხარისხის გადაწყვეტილებების მიწოდება მომხმარებლებისთვის.",
    fetchUsers: "მაგალითი მომხმარებლების ჩამოტვირთვა",
    loading: "მომხმარებელი იტვირთება...",
    error: "მომხმარებლების ჩამოტვირთვის შეცდომა:",
    noUsers: "No users found.",
  },
  contact: {
    title: "კონტაქტი",
    formName: "თქვენი სახელი",
    formEmail: "თქვენი ელ.ფოსტა",
    formMessage: "თქვენი შეტყობინება",
    submitButton: "შეტყობინების გაგზავნა",
    success: "შეტყობინება წარმატებით გაიგზავნა!",
    error: "შეტყობინების გაგზავნა ვერ მოხერხდა.",
  },
  header: {
    home: "მთავარი",
    about: "ჩვენს შესახებ",
    contact: "კონტაქტი",
    toggleTheme: "თემის შეცვლა",
    toggleLang: "ენის შეცვლა",
    georgian: "ქართული",
    english: "ინგლისური",
  },
  footer: {
    copyright: "© 2025 My React SPA. ყველა სახის უფლება დაცულია.",
  },
  notFound: {
    title: "404 - გვერდი ვერ მოიძებნა",
    description: "გვერდი, რომელსაც ეძებთ, არ არსებობს.",
    goHome: "მთავარ გვერდზე დაბრუნება",
  },
};

const allTranslations: Record<Language, Translations> = {
  en: enTranslations,
  ka: kaTranslations,
};

interface LanguageContextType {
  language: Language;
  translations: Translations;
  changeLanguage: (lang: Language) => void;
}
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>(
    "appLanguage",
    "en"
  );
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };
  const translations = allTranslations[language];
  return (
    <LanguageContext.Provider
      value={{ language, translations, changeLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// useApi Hook - მონაცემების ჩამოსატვირთად
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  fetchData: (config?: AxiosRequestConfig) => Promise<void>;
}

function useApi<T>(
  url: string,
  initialConfig?: AxiosRequestConfig
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const fetchData = useCallback(
    async (config?: AxiosRequestConfig) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api<T>({
          url,
          ...initialConfig,
          ...config,
        });
        setData(response.data);
      } catch (err: any) {
        setError(err as AxiosError);
      } finally {
        setLoading(false);
      }
    },
    [url, initialConfig]
  );

  return { data, loading, error, fetchData };
}

// =============================================================================
// 4. კომპონენტები (Components)
// =============================================================================

// ThemeApplier - თემის კლასის body-ზე დასამატებლად
const ThemeApplier: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useTheme();
  useEffect(() => {
    document.body.className = `${theme}-theme`;
  }, [theme]);
  return <>{children}</>;
};

// ThemeToggleButton - თემის გადამრთველი ღილაკი
const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { translations } = useLanguage();
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={translations.header.toggleTheme}
    >
      {theme === "light" ? "☀️" : "🌙"}
    </button>
  );
};

// Header - საიტის ზედა ნაწილი
const Header: React.FC = () => {
  const { theme } = useTheme();
  const { translations, language, changeLanguage } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as "en" | "ka");
  };

  return (
    <header className={`header ${theme}`}>
      <nav className="navigation">
        <Link to="/">{translations.header.home}</Link>
        <Link to="/about">{translations.header.about}</Link>
        <Link to="/contact">{translations.header.contact}</Link>
      </nav>
      <div className="controls">
        <ThemeToggleButton />
        <select
          value={language}
          onChange={handleLanguageChange}
          className="language-select"
          aria-label={translations.header.toggleLang}
        >
          <option value="en">{translations.header.english}</option>
          <option value="ka">{translations.header.georgian}</option>
        </select>
      </div>
    </header>
  );
};

// Footer - საიტის ქვედა ნაწილი
const Footer: React.FC = () => {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  return (
    <footer className={`footer ${theme}`}>
      <p>{translations.footer.copyright}</p>
    </footer>
  );
};

// =============================================================================
// 5. გვერდები (Pages)
// =============================================================================

// HomePage - მთავარი გვერდი
const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const { data: posts, loading, error, fetchData } = useApi<Post[]>("/posts");

  return (
    <div className={`page home-page ${theme}`}>
      <h1>{translations.home.title}</h1>
      <p>{translations.home.description}</p>

      <button
        onClick={() => fetchData()}
        disabled={loading}
        className="fetch-button"
      >
        {loading ? translations.home.loading : translations.home.fetchPosts}
      </button>

      {error && (
        <p className="error-text">
          {translations.home.error} {error.message}
        </p>
      )}

      {posts && posts.length > 0 ? (
        <div className="posts-grid">
          {posts.slice(0, 6).map((post) => (
            <div key={post.id} className="card post-card">
              <h3>{post.title}</h3>
              <p>{post.body.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p>{translations.home.noPosts}</p>
      )}
    </div>
  );
};

// AboutPage - ჩვენს შესახებ გვერდი
const AboutPage: React.FC = () => {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const { data: users, loading, error, fetchData } = useApi<User[]>("/users");

  return (
    <div className={`page about-page ${theme}`}>
      <h1>{translations.about.title}</h1>
      <p>{translations.about.description}</p>

      <button
        onClick={() => fetchData()}
        disabled={loading}
        className="fetch-button"
      >
        {loading ? translations.about.loading : translations.about.fetchUsers}
      </button>

      {error && (
        <p className="error-text">
          {translations.about.error} {error.message}
        </p>
      )}

      {users && users.length > 0 ? (
        <div className="users-grid">
          {users.slice(0, 5).map((user) => (
            <div key={user.id} className="card user-card">
              <h3>{user.name}</h3>
              <p>@{user.username}</p>
              <p>{user.email}</p>
              <p>{user.phone}</p>
              <a
                href={`http://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.website}
              </a>
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p>{translations.about.noUsers}</p>
      )}
    </div>
  );
};

// ContactPage - კონტაქტის გვერდი
const ContactPage: React.FC = () => {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    // API ზარის სიმულაცია
    setTimeout(() => {
      if (formData.name && formData.email && formData.message) {
        console.log("Form Submitted:", formData);
        setStatus("success");
        setFormData({ name: "", email: "", message: "" }); // ფორმის გასუფთავება
      } else {
        setStatus("error");
      }
    }, 1000);
  };

  return (
    <div className={`page contact-page ${theme}`}>
      <h1>{translations.contact.title}</h1>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">{translations.contact.formName}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">{translations.contact.formEmail}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">{translations.contact.formMessage}</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            required
          ></textarea>
        </div>
        <button type="submit" className="submit-button">
          {translations.contact.submitButton}
        </button>
        {status === "success" && (
          <p className="success-message">{translations.contact.success}</p>
        )}
        {status === "error" && (
          <p className="error-message">{translations.contact.error}</p>
        )}
      </form>
    </div>
  );
};

// NotFoundPage - 404 გვერდი
const NotFoundPage: React.FC = () => {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={`page not-found-page ${theme}`}>
      <h1>{translations.notFound.title}</h1>
      <p>{translations.notFound.description}</p>
      <button onClick={() => navigate("/")} className="home-link">
        {translations.notFound.goHome}
      </button>
    </div>
  );
};

// =============================================================================
// 6. მთავარი აპლიკაცია (App Component)
// =============================================================================

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <ThemeApplier>
            {/* Tailwind CSS CDN - MUST be included for Tailwind classes to work */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* აქ განვსაზღვრავთ ყველა CSS სტილს */}
            <style>
              {`
                /* Global Variables and Base Styles */
                :root {
                  --primary-color: #007bff;
                  --primary-rgb: 0, 123, 255;
                  --background-color: #f4f7f6;
                  --text-color: #333333;
                  --text-color-secondary: #555555;
                  --card-background: #ffffff;
                  --border-color: #e0e0e0;
                  --input-background: #fdfdfd;
                  --input-border-color: #dddddd;

                  /* Contact Page Specific Light Theme Colors */
                  --contact-bg-start-light: #e0f7fa;
                  --contact-bg-end-light: #ffffff;
                }

                body.dark-theme {
                  --primary-color: #82aaff;
                  --primary-rgb: 130, 170, 255;
                  --background-color: #1a1a1a;
                  --text-color: #ffffff;
                  --text-color-secondary: #cccccc;
                  --card-background: #2b2b2b;
                  --border-color: #444444;
                  --input-background: #3a3a3a;
                  --input-border-color: #555555;

                  /* Contact Page Specific Dark Theme Colors */
                  --contact-bg-start-dark: #2a2a2a;
                  --contact-bg-end-dark: #1a1a1a;
                }

                html, body, #root {
                  height: 100%;
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                    sans-serif;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                  box-sizing: border-box;
                }

                *, *::before, *::after {
                  box-sizing: inherit;
                }

                body {
                  background-color: var(--background-color);
                  color: var(--text-color);
                  transition: background-color 0.3s ease, color 0.3s ease;
                }

                /* App Container Layout */
                .app-container {
                  display: flex;
                  flex-direction: column;
                  min-height: 100vh;
                }

                .main-content {
                  flex: 1;
                  padding: 0;
                }

                /* Header Styles */
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 1rem 2rem;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  transition: background-color 0.3s ease, color 0.3s ease;
                }

                .header.light {
                  background-color: #ffffff;
                  color: #333333;
                }

                .header.dark {
                  background-color: #2c2c2c;
                  color: #ffffff;
                }

                .navigation {
                  display: flex;
                  gap: 1.5rem;
                }

                .navigation a {
                  text-decoration: none;
                  color: inherit;
                  font-weight: 500;
                  transition: color 0.3s ease;
                }

                .navigation a:hover {
                  color: var(--primary-color);
                }

                .controls {
                  display: flex;
                  gap: 1rem;
                  align-items: center;
                }

                .language-select {
                  background-color: transparent;
                  border: 1px solid var(--text-color);
                  color: var(--text-color);
                  padding: 0.4rem 0.8rem;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 0.9rem;
                  transition: border-color 0.3s ease;
                }

                .language-select:focus {
                  outline: none;
                  border-color: var(--primary-color);
                }

                .language-select option {
                  background-color: var(--background-color);
                  color: var(--text-color);
                }

                /* Theme Toggle Button */
                .theme-toggle {
                  background: none;
                  border: 1px solid var(--text-color);
                  border-radius: 5px;
                  padding: 0.5rem 0.8rem;
                  font-size: 1.2rem;
                  cursor: pointer;
                  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
                  color: var(--text-color);
                }

                .theme-toggle:hover {
                  background-color: var(--primary-color);
                  color: var(--background-color);
                }

                /* Footer Styles */
                .footer {
                  padding: 1rem 2rem;
                  text-align: center;
                  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
                  margin-top: auto;
                  transition: background-color 0.3s ease, color 0.3s ease;
                }

                .footer.light {
                  background-color: #f8f8f8;
                  color: #555555;
                }

                .footer.dark {
                  background-color: #1f1f1f;
                  color: #aaaaaa;
                }

                .footer p {
                  margin: 0;
                  font-size: 0.9rem;
                }

                /* Page Base Styles */
                .page {
                  padding: 2rem;
                  text-align: center;
                  transition: background-color 0.3s ease, color 0.3s ease;
                }

                .page h1 {
                  font-size: 2.5rem;
                  margin-bottom: 1rem;
                  color: var(--text-color);
                }

                .page p {
                  font-size: 1.1rem;
                  line-height: 1.6;
                  color: var(--text-color-secondary);
                  max-width: 800px;
                  margin: 0 auto 2rem auto;
                }

                .fetch-button {
                  background-color: var(--primary-color);
                  color: #ffffff;
                  border: none;
                  padding: 0.8rem 1.5rem;
                  border-radius: 5px;
                  font-size: 1rem;
                  cursor: pointer;
                  transition: background-color 0.3s ease;
                  margin-bottom: 2rem;
                }

                .fetch-button:hover:not(:disabled) {
                  background-color: #0056b3; /* Darken primary color */
                }

                .fetch-button:disabled {
                  background-color: #cccccc;
                  cursor: not-allowed;
                }

                .error-text {
                  color: #e74c3c;
                  margin-top: 1rem;
                }

                .card {
                  background-color: var(--card-background);
                  border: 1px solid var(--border-color);
                  border-radius: 8px;
                  padding: 1.5rem;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
                  text-align: left;
                }

                .card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
                }

                .card h3 {
                  font-size: 1.2rem;
                  margin-top: 0;
                  margin-bottom: 0.8rem;
                  color: var(--text-color);
                }

                .card p {
                  font-size: 0.9rem;
                  color: var(--text-color-secondary);
                  margin-bottom: 0;
                  line-height: 1.5;
                }

                /* Home Page Specific */
                .posts-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                  gap: 1.5rem;
                  margin-top: 2rem;
                  max-width: 1200px;
                  margin-left: auto;
                  margin-right: auto;
                }

                /* About Page Specific */
                .users-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                  gap: 1.5rem;
                  margin-top: 2rem;
                  max-width: 1200px;
                  margin-left: auto;
                  margin-right: auto;
                }

                .user-card h3 {
                  font-size: 1.3rem;
                }

                .user-card p {
                  font-size: 0.95rem;
                  margin-bottom: 0.3rem;
                }

                .user-card a {
                  color: var(--primary-color);
                  text-decoration: none;
                  font-size: 0.95rem;
                }

                .user-card a:hover {
                  text-decoration: underline;
                }

                /* Contact Page Specific */
                .contact-page {
                  min-height: calc(100vh - 120px); /* Adjust based on header/footer height */
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 2rem;
                  background: linear-gradient(135deg, var(--contact-bg-start-light), var(--contact-bg-end-light));
                  transition: background 0.5s ease;
                }

                body.dark-theme .contact-page {
                  background: linear-gradient(135deg, var(--contact-bg-start-dark), var(--contact-bg-end-dark));
                }

                .contact-page h1 {
                  font-size: 3rem;
                  margin-bottom: 2.5rem;
                  color: var(--text-color);
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }

                .contact-form {
                  max-width: 600px;
                  width: 90%; /* Make it more responsive */
                  margin: 0 auto;
                  background-color: var(--card-background);
                  padding: 3rem; /* Increased padding */
                  border-radius: 15px; /* More rounded corners */
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); /* More prominent shadow */
                  border: 1px solid var(--border-color);
                  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                }

                .form-group {
                  margin-bottom: 1.8rem; /* Increased margin */
                  text-align: left;
                }

                .form-group label {
                  display: block;
                  margin-bottom: 0.7rem; /* Increased margin */
                  font-weight: 600;
                  color: var(--text-color);
                  font-size: 1.05rem; /* Slightly larger font */
                }

                .form-group input[type="text"],
                .form-group input[type="email"],
                .form-group textarea {
                  width: 100%;
                  padding: 1rem; /* Increased padding */
                  border: 1px solid var(--input-border-color);
                  border-radius: 8px; /* More rounded input fields */
                  font-size: 1rem;
                  background-color: var(--input-background);
                  color: var(--text-color);
                  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.2s ease;
                }

                .form-group input[type="text"]:focus,
                .form-group input[type="email"]:focus,
                .form-group textarea:focus {
                  outline: none;
                  border-color: var(--primary-color);
                  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.3); /* More visible focus */
                }

                .form-group textarea {
                  resize: vertical;
                  min-height: 150px; /* Taller textarea */
                }

                .submit-button {
                  background-color: var(--primary-color);
                  color: #ffffff;
                  border: none;
                  padding: 1rem 2.5rem; /* Larger padding */
                  border-radius: 8px; /* More rounded button */
                  font-size: 1.15rem; /* Slightly larger font */
                  cursor: pointer;
                  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
                  width: 100%;
                  font-weight: bold;
                  letter-spacing: 0.5px;
                }

                .submit-button:hover {
                  background-color: #0056b3; /* Darken primary color */
                  transform: translateY(-3px); /* More pronounced lift */
                  box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.3);
                }

                .submit-button:active {
                  transform: translateY(0);
                  box-shadow: 0 5px 15px rgba(var(--primary-rgb), 0.2);
                }

                .success-message {
                  color: #28a745;
                  margin-top: 1.5rem;
                  font-weight: 600;
                  font-size: 1.1rem;
                }

                .error-message {
                  color: #dc3545;
                  margin-top: 1.5rem;
                  font-weight: 600;
                  font-size: 1.1rem;
                }

                /* Not Found Page Specific */
                .not-found-page {
                  min-height: calc(100vh - 120px); /* Adjust based on header/footer height */
                }

                .not-found-page h1 {
                  font-size: 4rem;
                  margin-bottom: 1rem;
                  color: var(--primary-color);
                }

                .not-found-page p {
                  font-size: 1.5rem;
                  margin-bottom: 2rem;
                }

                .home-link {
                  background-color: var(--primary-color);
                  color: #ffffff;
                  padding: 0.8rem 1.5rem;
                  border-radius: 5px;
                  text-decoration: none;
                  font-size: 1.1rem;
                  transition: background-color 0.3s ease, transform 0.2s ease;
                }

                .home-link:hover {
                  background-color: #0056b3; /* Darken primary color */
                  transform: translateY(-2px);
                }

                /* Responsive Styles */
                @media (max-width: 1024px) { /* Tablet breakpoint */
                  .header {
                    padding: 1rem;
                  }
                  .navigation {
                    gap: 1rem;
                  }
                  .page {
                    padding: 1.5rem;
                  }
                  .page h1 {
                    font-size: 2rem;
                  }
                  .page p {
                    font-size: 1rem;
                  }
                  .contact-form {
                    padding: 2rem;
                  }
                  .not-found-page h1 {
                    font-size: 3rem;
                  }
                  .not-found-page p {
                    font-size: 1.2rem;
                  }
                }

                @media (max-width: 768px) { /* Mobile breakpoint */
                  .header {
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem;
                  }
                  .navigation {
                    flex-direction: column;
                    gap: 0.8rem;
                    align-items: center;
                  }
                  .controls {
                    width: 100%;
                    justify-content: center;
                  }
                  .footer {
                    padding: 0.8rem;
                  }
                  .page {
                    padding: 1rem;
                  }
                  .page h1 {
                    font-size: 1.8rem;
                  }
                  .page p {
                    font-size: 0.95rem;
                  }
                  .posts-grid, .users-grid {
                    grid-template-columns: 1fr; /* Single column on mobile */
                  }
                  .contact-form {
                    padding: 1.5rem;
                  }
                  .not-found-page h1 {
                    font-size: 2.5rem;
                  }
                  .not-found-page p {
                    font-size: 1rem;
                  }
                  .home-link {
                    padding: 0.6rem 1.2rem;
                    font-size: 1rem;
                  }
                }
              `}
            </style>

            <div className="app-container">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<NotFoundPage />} />{" "}
                  {/* 404 Route */}
                </Routes>
              </main>
              <Footer />
            </div>
          </ThemeApplier>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

// =============================================================================
// 7. აპლიკაციის საწყისი წერტილი (Root Render)
// =============================================================================
// ეს ნაწილი ათავსებს React აპლიკაციას HTML-ის "root" ელემენტში.
// საჭიროა, როდესაც ყველაფერი ერთ ფაილშია.
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element with ID "root" not found in the document.');
}
