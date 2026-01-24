import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { FilterBar, FilterState } from '@/components/dashboard/FilterBar';
import { TicketTable } from '@/components/dashboard/TicketTable';
import { TicketDetailPanel } from '@/components/dashboard/TicketDetailPanel';
import { SLAMonitorView } from '@/components/dashboard/SLAMonitorView';
import { InsightsView } from '@/components/dashboard/InsightsView';
import { MasterTicketsView } from '@/components/dashboard/MasterTicketsView';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { mockTickets, Ticket } from '@/data/mockData';
const defaultFilters: FilterState = {
  category: 'all',
  severity: 'all',
  tier: 'all',
  status: 'all',
  slaStatus: 'all',
  sortBy: 'sla',
};

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.severity !== 'all') count++;
    if (filters.tier !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.slaStatus !== 'all') count++;
    return count;
  }, [filters]);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let result = [...mockTickets];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query) ||
          ticket.customerName.toLowerCase().includes(query) ||
          ticket.customerEmail.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter((ticket) => ticket.category === filters.category);
    }

    // Severity filter
    if (filters.severity !== 'all') {
      result = result.filter((ticket) => ticket.severity === filters.severity);
    }

    // Tier filter
    if (filters.tier !== 'all') {
      result = result.filter((ticket) => ticket.tier === filters.tier);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((ticket) => ticket.status === filters.status);
    }

    // SLA Status filter
    if (filters.slaStatus !== 'all') {
      result = result.filter((ticket) => ticket.slaStatus === filters.slaStatus);
    }

    // Sorting
    const severityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };
    switch (filters.sortBy) {
      case 'sla':
        result.sort((a, b) => a.slaTimeRemaining - b.slaTimeRemaining);
        break;
      case 'confidence':
        result.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'severity':
        result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return result;
  }, [mockTickets, searchQuery, filters]);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={handleMenuClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
          activeItem={activeMenuItem}
          onItemClick={setActiveMenuItem}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {activeMenuItem === 'inbox' && (
            <>
              {/* Ticket List */}
              <motion.div
                layout
                className="flex-1 flex flex-col overflow-hidden border-r border-border"
              >
                <FilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  activeFiltersCount={activeFiltersCount}
                  onClearFilters={handleClearFilters}
                />

                <div className="flex-1 overflow-auto scrollbar-thin">
                  <TicketTable
                    tickets={filteredTickets}
                    selectedTicketId={selectedTicket?.id || null}
                    onSelectTicket={handleSelectTicket}
                  />
                </div>

                {/* Stats bar */}
                <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredTickets.length}</span> of{' '}
                    <span className="font-medium text-foreground">{mockTickets.length}</span> tickets
                  </span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-destructive" />
                      {mockTickets.filter((t) => t.slaStatus === 'Breached').length} Breached
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      {mockTickets.filter((t) => t.slaStatus === 'Warning').length} Warning
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      {mockTickets.filter((t) => t.slaStatus === 'Safe').length} Safe
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Ticket Detail Panel */}
              {selectedTicket && (
                <TicketDetailPanel ticket={selectedTicket} onClose={handleCloseDetail} />
              )}
            </>
          )}

          {activeMenuItem === 'master' && <MasterTicketsView />}
          {activeMenuItem === 'sla' && <SLAMonitorView />}
          {activeMenuItem === 'insights' && <InsightsView />}
          {activeMenuItem === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default Index;
