import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { SiteSelectionPage } from '../pages/SiteSelectionPage';
import { AnalysisPage } from '../pages/AnalysisPage';
import { ComparePage } from '../pages/ComparePage';
import { ReportPage } from '../pages/ReportPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<SiteSelectionPage />} />
        <Route path="/analysis/:id" element={<AnalysisPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/report/:id" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
