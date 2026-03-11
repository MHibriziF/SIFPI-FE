"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ProjectCard } from "@/shared/components/project-card";
import { getPublishedProjects } from "@/features/project/services";
import type { ProjectCardData } from "@/shared/components/project-card";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/shared/components/button";
import { Select, TextInput } from "@/shared/components/form-fields";
import { SECTOR_OPTIONS } from "@/shared/enums";

/** Radix Select.Item disallows value="" — use a sentinel for "all" options */
const ALL = "__all__";

const SECTOR_FILTER_OPTIONS = [
  { value: ALL, label: "Semua Sektor" },
  ...SECTOR_OPTIONS,
];

const FUNDING_SCHEME_OPTIONS = [
  { value: ALL, label: "Semua Skema" },
  { value: "KPBU", label: "KPBU" },
  { value: "BOT", label: "BOT (Build-Operate-Transfer)" },
  { value: "BTO", label: "BTO (Build-Transfer-Operate)" },
  { value: "BOO", label: "BOO (Build-Own-Operate)" },
  { value: "Concession", label: "Concession" },
  { value: "Joint Venture", label: "Joint Venture" },
];

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Terbaru" },
  { value: "createdAt-asc", label: "Terlama" },
  { value: "totalCapex-desc", label: "Budget Tertinggi" },
  { value: "totalCapex-asc", label: "Budget Terendah" },
  { value: "name-asc", label: "A-Z" },
];

export function PublicProjectCatalogue() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sector, setSector] = useState("");
  const [fundingScheme, setFundingScheme] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("createdAt-desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [sortField, sortDirection] = sortBy.split("-") as [string, "asc" | "desc"];

    try {
      const response = await getPublishedProjects({
        page: currentPage,
        size: pageSize,
        sector: sector || undefined,
        cooperationModel: fundingScheme || undefined,
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
  }, [currentPage, pageSize, sector, fundingScheme, keyword, sortBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
        <Image
          src="/png/home-bg-banner.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
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
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TextInput
              label="Cari Proyek"
              placeholder="Masukkan nama proyek..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(0);
              }}
            />
            <Select
              label="Sektor"
              options={SECTOR_FILTER_OPTIONS}
              value={sector || ALL}
              onValueChange={(val) => {
                setSector(val === ALL ? "" : val);
                setCurrentPage(0);
              }}
            />
            <Select
              label="Skema Pendanaan"
              options={FUNDING_SCHEME_OPTIONS}
              value={fundingScheme || ALL}
              onValueChange={(val) => {
                setFundingScheme(val === ALL ? "" : val);
                setCurrentPage(0);
              }}
            />
            <Select
              label="Urutkan"
              options={SORT_OPTIONS}
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setCurrentPage(0);
              }}
            />
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
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewDetailHref={`/projects/${project.id}`}
                  hideStatusBadge
                  showSubmittedDate
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {currentPage * pageSize + 1}-
                {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
                {totalElements} entries
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={currentPage <= 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? "filled" : "ghost"}
                    size="icon-sm"
                    onClick={() => handlePageChange(i)}
                    className="text-xs"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
