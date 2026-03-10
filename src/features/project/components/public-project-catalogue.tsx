"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProjectCard } from "@/shared/components/project-card";
import { getPublishedProjects } from "@/features/project/services";
import type { ProjectCardData } from "@/shared/components/project-card";
import { Search } from "lucide-react";
import { Button } from "@/shared/components/button";

const SECTORS = [
  { value: "", label: "All Sectors" },
  { value: "PUBLIC_TRANSPORTATION", label: "Public Transportation" },
  { value: "LAND_BASED_TRANSPORT", label: "Land Based Transport (Rails and Road Transport)" },
  { value: "WASTE_MANAGEMENT", label: "Waste Management" },
  { value: "TOLL_ROAD", label: "Toll Road" },
  { value: "AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT", label: "Affordable Housing and Transit-oriented Development" },
  { value: "HEALTH", label: "Health" },
  { value: "WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION", label: "Water Resource, Drinking Water, and Irrigation" },
  { value: "MARITIME", label: "Maritime" },
  { value: "OIL_GAS_AND_ENERGY", label: "Oil & Gas, and Energy" },
  { value: "AVIATION", label: "Aviation" },
  { value: "DIGITAL_AND_TELECOMMUNICATIONS", label: "Digital & Telecommunications" },
  { value: "EDUCATION_RESEARCH_AND_DEVELOPMENT", label: "Education, Research, and Development" },
  { value: "URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES", label: "Urban Economics Infrastructure Facilities" },
];

const PROVINCES = [
  { value: "", label: "All Locations" },
  { value: "DKI Jakarta", label: "DKI Jakarta" },
  { value: "Jawa Barat", label: "Jawa Barat" },
  { value: "Jawa Tengah", label: "Jawa Tengah" },
  { value: "Jawa Timur", label: "Jawa Timur" },
  { value: "Banten", label: "Banten" },
  { value: "Bali", label: "Bali" },
  { value: "Sumatera Utara", label: "Sumatera Utara" },
  { value: "Sumatera Barat", label: "Sumatera Barat" },
  { value: "Sumatera Selatan", label: "Sumatera Selatan" },
  { value: "Kalimantan Timur", label: "Kalimantan Timur" },
  { value: "Sulawesi Selatan", label: "Sulawesi Selatan" },
];

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Terbaru" },
  { value: "totalCapex-desc", label: "Budget Tertinggi" },
  { value: "name-asc", label: "A-Z" },
];

export function PublicProjectCatalogue() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("createdAt-desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    // Parse sortBy (format: "field-direction")
    const [sortField, sortDirection] = sortBy.split("-") as [string, "asc" | "desc"];

    try {
      const response = await getPublishedProjects({
        page: currentPage,
        size: pageSize,
        sector: sector || undefined,
        location: location || undefined,
        search: keyword || undefined,
        sortBy: sortField,
        sortDirection: sortDirection,
      });

      if (response.data) {
        setProjects(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError("An error occurred while fetching projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, sortBy]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchProjects();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[30vh] min-h-[250px] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/png/home-bg-banner.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />

        {/* Hero Content */}
        <div className="relative mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="font-bold text-white text-[clamp(2rem,4vw,3rem)] mb-4">
            Public Project Catalogue
          </h1>
          <p className="text-lg text-white/95 leading-relaxed max-w-2xl mx-auto">
            Browse published infrastructure projects available for investment
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Horizontal Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Sector Filter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(0); // Reset to first page when sorting changes
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Keyword
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search projects..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary placeholder:text-gray-400 outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSearch}
              variant="filled"
              className="flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </Button>
          </div>
        </div>

      {/* Results Info & Per Page Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="text-sm text-gray-600">
          Showing {projects.length > 0 ? currentPage * pageSize + 1 : 0} -{" "}
          {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
          {totalElements} projects
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-primary">Results per page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-primary outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <p className="font-medium">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
          <Search size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search keywords
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} viewDetailHref={`/projects/${project.id}`} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-sm text-gray-600">
                Showing {currentPage * pageSize + 1}-
                {Math.min((currentPage + 1) * pageSize, totalElements)} of{' '}
                {totalElements} projects
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="border-primary text-primary"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outlined"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="border-primary text-primary"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
