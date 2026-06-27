import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, PenSquare, LogIn, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { user, isEnabled, signOut } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Button
          asChild
          variant="link"
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          <Link to="/">Modern Blog</Link>
        </Button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-3 py-1.5 rounded-full border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
            >
              <Search size={16} />
            </button>
          </form>

          <Button
            asChild
            className="bg-[hsl(var(--primary))] text-white hover:bg-blue-700 transition-colors"
          >
            <Link to="/">Home</Link>
          </Button>

          {(!isEnabled || user) && (
            <Button
              asChild
              className="bg-[hsl(var(--primary))] text-white hover:bg-blue-800 transition-colors flex items-center gap-1"
            >
              <Link to="/create">
                <PenSquare className="h-4 w-4" />
                Write Post
              </Link>
            </Button>
          )}

          {isEnabled && (
            user ? (
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </Link>
              </Button>
            )
          )}
        </nav>

        {/* Mobile Menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] focus:outline-none"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-full border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
            >
              <Search size={16} />
            </button>
          </form>

          <div className="flex flex-col space-y-2">
            <Button
              asChild
              className="w-full justify-start bg-[hsl(var(--primary))] text-white hover:bg-blue-700 transition-colors"
            >
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </Button>

            {(!isEnabled || user) && (
              <Button
                asChild
                className="w-full justify-start bg-[hsl(var(--primary))] text-white hover:bg-blue-800 transition-colors flex items-center gap-1"
              >
                <Link to="/create" onClick={() => setIsMenuOpen(false)}>
                  <PenSquare className="h-4 w-4" />
                  Write Post
                </Link>
              </Button>
            )}

            {isEnabled && (
              user ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </Link>
                </Button>
              )
            )}

            {categories.length > 0 && (
              <div className="pt-2 border-t border-[hsl(var(--border))]">
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      asChild
                      variant="outline"
                      size="sm"
                      className="hover:bg-[hsl(var(--primary))] hover:text-white"
                    >
                      <Link
                        to={`/category/${cat}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {cat}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
