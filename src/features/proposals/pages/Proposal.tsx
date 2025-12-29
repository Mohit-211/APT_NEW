import { useEffect, useState, useRef } from "react";
import {
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  FolderOpen,
} from "lucide-react";
import Banner from "@/components/layout/Banner";
import CardComponent from "../components/Cards.tsx";
import { Image_URL } from "@/utils/constants/host";
import {
  GetProposalCategoryList,
  ProposalByCategoryApi,
} from "@/utils/api/Api";
import "./Proposal.scss";

// Types ------------------------------------------------------------------
interface CategoryItem {
  title: string;
  slug: string;
  file_name: string;
}

interface APIProposal {
  id: number;
  title: string;
  file_name: string;
  file_type?: string;
  proposal_type?: string;
}

// UI-safe format for CardComponent
interface ProposalCardShape {
  id: number;
  title: string;
  file_name: string;
  file_type: string;
  proposal_type: string;
}

// Component --------------------------------------------------------------
export default function Proposal() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [proposals, setProposals] = useState<APIProposal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<string | number>("all");
  const [title, setTitle] = useState("All Proposals");
  const [img, setImage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;
  const [totalCount, setTotalCount] = useState(0);

  const drawerRef = useRef<HTMLDivElement>(null);

  const userToken =
    typeof window !== "undefined"
      ? localStorage.getItem("UserLoginTokenApt")
      : null;

  // Fetch categories -----------------------------------------------------
  useEffect(() => {
    GetProposalCategoryList()
      .then((res) => {
        setCategories(res?.data?.data || []);
      })
      .catch(console.error);
  }, []);

  // Fetch proposals ------------------------------------------------------
  useEffect(() => {
    setLoading(true);
    ProposalByCategoryApi(selectedCategory, PER_PAGE, page)
      .then((res) => {
        setProposals(res?.data?.data?.rows || []);
        setTotalCount(res?.data?.data?.count || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, page]);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setDrawerOpen(false);
      }
    };

    if (drawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "";
      };
    }
  }, [drawerOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handlers -------------------------------------------------------------
  const handleCategoryClick = (
    idx: number | string,
    title: string,
    slug: string,
    fileName: string
  ) => {
    setSelectedIndex(idx);
    setSelectedCategory(slug);
    setTitle(title);
    setImage(fileName);
    setPage(1);
    setDrawerOpen(false);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  // Category list component
  const CategoryList = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className={`category-list ${inDrawer ? "category-list--drawer" : ""}`}>
      <h3 className="category-list__title">
        <FolderOpen size={18} />
        Categories
      </h3>
      <ul className="category-list__items">
        {[
          { title: "All Proposals", slug: "all", file_name: "" },
          ...categories,
        ].map((item, idx) => {
          const isActive =
            (idx === 0 && selectedIndex === "all") || selectedIndex === idx - 1;
          return (
            <li key={item.slug}>
              <button
                className={`category-item ${
                  isActive ? "category-item--active" : ""
                }`}
                onClick={() =>
                  handleCategoryClick(
                    idx === 0 ? "all" : idx - 1,
                    item.title,
                    item.slug,
                    item.file_name
                  )
                }
              >
                <span className="category-item__text">{item.title}</span>
                {isActive && <span className="category-item__indicator" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  // Unauthenticated state
  if (!userToken) {
    return (
      <div className="proposal-page">
        <div className="auth-required">
          <div className="auth-required__icon">
            <FileText size={48} />
          </div>
          <h2 className="auth-required__title">Sign In Required</h2>
          <p className="auth-required__message">
            Please sign in to view proposals and access your documents.
          </p>
          <a href="/signin" className="btn btn--primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Render ---------------------------------------------------------------
  return (
    <div className="proposal-page">
      {/* Banner */}
      <Banner
        CalculatorName={title}
        CalculatorDesc="Browse and manage your proposal templates"
        CalculatorImage={
          selectedCategory === "all" ? "/assets/proposal.jpg" : Image_URL + img
        }
      />

      {/* Mobile Filter Button */}
      <button className="filter-button" onClick={() => setDrawerOpen(true)}>
        <Filter size={18} />
        <span>Filter Categories</span>
      </button>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="drawer-overlay">
          <div className="drawer" ref={drawerRef}>
            <div className="drawer__header">
              <h3 className="drawer__title">Categories</h3>
              <button
                className="drawer__close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="drawer__content">
              <CategoryList inDrawer />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="proposal-container">
        {/* Sidebar (Desktop) */}
        <aside className="proposal-sidebar">
          <CategoryList />
        </aside>

        {/* Proposals Grid */}
        <main className="proposal-content">
          {loading ? (
            <div className="loading-state">
              <Loader2 size={40} className="loading-state__spinner" />
              <p className="loading-state__text">Loading proposals...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <FileText size={48} />
              </div>
              <h3 className="empty-state__title">No Proposals Found</h3>
              <p className="empty-state__message">
                There are no proposals available in this category.
              </p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="results-header">
                <p className="results-header__count">
                  Showing {(page - 1) * PER_PAGE + 1}–
                  {Math.min(page * PER_PAGE, totalCount)} of {totalCount}{" "}
                  proposals
                </p>
              </div>

              {/* Proposals Grid */}
              <div className="proposals-grid">
                {proposals.map((item) => {
                  const fixedData: ProposalCardShape = {
                    id: item.id,
                    title: item.title,
                    file_name: item.file_name,
                    file_type: item.file_type ?? "pdf",
                    proposal_type: item.proposal_type ?? "standard",
                  };
                  return <CardComponent key={item.id} data={fixedData} />;
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Pagination">
                  <button
                    className="pagination__btn pagination__btn--nav"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="pagination__pages">
                    {getPageNumbers().map((pageNum, idx) =>
                      pageNum === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="pagination__ellipsis"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          className={`pagination__btn ${
                            page === pageNum ? "pagination__btn--active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNum as number)}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className="pagination__btn pagination__btn--nav"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
