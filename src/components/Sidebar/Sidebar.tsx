import { useState } from 'react';
import { useContentLibrary } from '../../hooks/useContentLibrary';
import { useSkillGaps } from '../../hooks/useSkillGaps';
import { ContentLibraryDoc, SkillGap } from '../../types/database';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';

interface SidebarProps {
  userId?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ userId, isOpen, onToggle }: SidebarProps) {
  const { docs, loading: docsLoading } = useContentLibrary();
  const { skillGaps, loading: skillsLoading } = useSkillGaps(userId);
  const [selectedDoc, setSelectedDoc] = useState<ContentLibraryDoc | null>(null);
  const [selectedSkillGap, setSelectedSkillGap] = useState<SkillGap | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['guides']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const openDoc = (doc: ContentLibraryDoc) => {
    setSelectedDoc(doc);
    setSelectedSkillGap(null);
  };

  const openSkillGap = (gap: SkillGap) => {
    setSelectedSkillGap(gap);
    setSelectedDoc(null);
  };

  const closeViewer = () => {
    setSelectedDoc(null);
    setSelectedSkillGap(null);
  };

  // Group docs by category
  const docsByCategory = docs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, ContentLibraryDoc[]>);

  // Group skill gaps by category
  const skillGapsByCategory = skillGaps.reduce((acc, gap) => {
    if (!acc[gap.category]) {
      acc[gap.category] = [];
    }
    acc[gap.category].push(gap);
    return acc;
  }, {} as Record<string, SkillGap[]>);

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          isOpen ? 'w-80' : 'w-12'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg
            className={`w-3 h-3 text-gray-600 transition-transform ${
              isOpen ? '' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Sidebar Content */}
        {isOpen && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Resources
            </h2>

            {(docsLoading || skillsLoading) ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {/* Guides Section */}
                {docsByCategory['guides'] && (
                  <div>
                    <button
                      onClick={() => toggleSection('guides')}
                      className="w-full flex items-center justify-between text-sm font-medium text-ink hover:text-bt3Red transition-colors"
                    >
                      <span>Guides</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedSections.has('guides') ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedSections.has('guides') && (
                      <div className="mt-2 ml-2 space-y-1">
                        {docsByCategory['guides'].map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => openDoc(doc)}
                            className="block w-full text-left text-sm text-gray-700 hover:text-bt3Red hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                          >
                            {doc.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Skill Gaps Section */}
                {Object.keys(skillGapsByCategory).length > 0 && (
                  <div>
                    <button
                      onClick={() => toggleSection('skills')}
                      className="w-full flex items-center justify-between text-sm font-medium text-ink hover:text-bt3Red transition-colors"
                    >
                      <span>Skill Gaps</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedSections.has('skills') ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedSections.has('skills') && (
                      <div className="mt-2 ml-2 space-y-1">
                        {skillGaps.filter(gap => gap.is_global).map((gap) => (
                          <button
                            key={gap.id}
                            onClick={() => openSkillGap(gap)}
                            className="block w-full text-left text-sm text-gray-700 hover:text-bt3Red hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                          >
                            {gap.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reference Section */}
                {docsByCategory['reference'] && (
                  <div>
                    <button
                      onClick={() => toggleSection('reference')}
                      className="w-full flex items-center justify-between text-sm font-medium text-ink hover:text-bt3Red transition-colors"
                    >
                      <span>Reference</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedSections.has('reference') ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedSections.has('reference') && (
                      <div className="mt-2 ml-2 space-y-1">
                        {docsByCategory['reference'].map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => openDoc(doc)}
                            className="block w-full text-left text-sm text-gray-700 hover:text-bt3Red hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                          >
                            {doc.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Automation Section */}
                {docsByCategory['automation'] && (
                  <div>
                    <button
                      onClick={() => toggleSection('automation')}
                      className="w-full flex items-center justify-between text-sm font-medium text-ink hover:text-bt3Red transition-colors"
                    >
                      <span>Automation</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedSections.has('automation') ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedSections.has('automation') && (
                      <div className="mt-2 ml-2 space-y-1">
                        {docsByCategory['automation'].map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => openDoc(doc)}
                            className="block w-full text-left text-sm text-gray-700 hover:text-bt3Red hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                          >
                            {doc.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {(selectedDoc || selectedSkillGap) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeViewer}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">
                {selectedDoc?.title || selectedSkillGap?.name}
              </h2>
              <button
                onClick={closeViewer}
                className="text-gray-400 hover:text-ink transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              {selectedDoc && <MarkdownRenderer content={selectedDoc.content} />}
              {selectedSkillGap && (
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-700 mb-4">{selectedSkillGap.description}</p>
                  </div>

                  {/* OODA Loop */}
                  {selectedSkillGap.ooda_loop && (
                    <div>
                      <h3 className="text-lg font-semibold text-ink mb-3">
                        OODA Loop ({selectedSkillGap.ooda_loop.frequency})
                      </h3>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <strong className="text-bt3Red">Observe:</strong>{' '}
                          <span className="text-gray-700">{selectedSkillGap.ooda_loop.observe}</span>
                        </div>
                        <div>
                          <strong className="text-bt3Red">Orient:</strong>{' '}
                          <span className="text-gray-700">{selectedSkillGap.ooda_loop.orient}</span>
                        </div>
                        <div>
                          <strong className="text-bt3Red">Decide:</strong>{' '}
                          <span className="text-gray-700">{selectedSkillGap.ooda_loop.decide}</span>
                        </div>
                        <div>
                          <strong className="text-bt3Red">Act:</strong>{' '}
                          <span className="text-gray-700">{selectedSkillGap.ooda_loop.act}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drills */}
                  {selectedSkillGap.drills && selectedSkillGap.drills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-ink mb-3">Drills</h3>
                      <div className="space-y-4">
                        {selectedSkillGap.drills.map((drill, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-ink mb-2">{drill.name}</h4>
                            <p className="text-gray-700 text-sm">{drill.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
