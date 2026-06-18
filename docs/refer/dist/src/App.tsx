import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ChapterPage from './pages/ChapterPage';
import ThemeProvider from './components/common/ThemeProvider';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="chapter/:chapterId" element={<ChapterPage />} />
            <Route path="chapter/:chapterId/section/:sectionId" element={<ChapterPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
