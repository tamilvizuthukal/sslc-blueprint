import React from 'react';
import { Blueprint } from '../../types';
import { getCurrentAcademicYear } from '../../services/db';

interface ReportHeaderProps {
  blueprint: Blueprint;
  sectionTitle: string;
  orientation?: 'portrait' | 'landscape';
  hidePart2Title?: boolean;
}

const getRomanClass = (cls: string | number): string => {
  const c = String(cls).toUpperCase();
  if (c === '8' || c === '_8') return 'VIII';
  if (c === '9' || c === '_9') return 'IX';
  if (c === '10' || c === '_10' || c === 'SSLC' || c === '_SSLC') return 'X';
  return c;
};

export const ReportHeader: React.FC<ReportHeaderProps> = ({ blueprint, sectionTitle, hidePart2Title = false }) => {
  const isAT = blueprint.subject.includes('AT');
  const subjectEnglish = isAT ? "First Language Paper I" : "First Language Paper II";
  const subjectCode = isAT ? "AT" : "BT";

  // Question Paper code - T prefix
  const codeMap: Record<string, string> = {
    '8-AT': '802',  '8-BT': '812',
    '9-AT': '902',  '9-BT': '912',
    '10-AT': '1002', '10-BT': '1012'
  };
  const baseCode = codeMap[`${blueprint.classLevel}-${subjectCode}`] || `${blueprint.classLevel}${isAT ? '02' : '12'}`;
  const paperCode = `T-${baseCode}`;
  
  const setLetter = (blueprint.setId || 'A').replace(/SET\s+/i, '').trim().charAt(0).toUpperCase();
  
  const classVal = getRomanClass(blueprint.classLevel);
  const termName = blueprint.examTerm || 'First Term Summative';
  const termVal = /second|\bii\b/i.test(termName) ? 'II' : /third|final|\biii\b/i.test(termName) ? 'III' : /first|\bi\b/i.test(termName) ? 'I' : termName;
  const yearVal = blueprint.academicYear || getCurrentAcademicYear();
  const timeVal = blueprint.totalMarks <= 40 ? "1.30 Hrs" : "2.30 Hrs";
  const scoreVal = blueprint.totalMarks;

  const isReport1 = sectionTitle.includes("QUESTION PAPER DESIGN") || sectionTitle.includes("PART – III");
  const isReport2 = sectionTitle.includes("ITEM-WISE ANALYSIS");
  const isReport3 = sectionTitle.includes("UNIT WISE ANALYSIS") || sectionTitle.includes("BLUEPRINT MATRIX") || sectionTitle.includes("CONTENT AREA ANALYSIS");
  const report2Header = (blueprint as Blueprint & { report2Header?: {
    boardName?: string; examinationName?: string; examinationYear?: string;
    paperCode?: string; maximumTime?: string; timeAllotted?: string; sections?: string;
  } }).report2Header || {};
  const report2PaperCode = isAT ? 'S 3002' : 'S 3011';
  const report2TimeAllotted = report2Header.timeAllotted || `${blueprint.items.reduce((total, item) => total + (Number(item.time) || 0), 0)} minutes`;

  return (
    <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px', color: '#000', fontFamily: "'Times New Roman', Times, serif" }} className="no-print-header-color">
      
      {/* Horizontal top line */}
      <div style={{ borderTop: '1px solid #000000', margin: '0 0 8px 0' }} />

      {/* Centered Main Title - Report 1 */}
      {isReport1 && (
        <>
          <div style={{ textAlign: 'center', color: '#000', fontSize: '15pt', fontWeight: 'bold', margin: '8px 0' }}>
            Question Paper Design
          </div>
          {/* Horizontal line under main title */}
          <div style={{ borderTop: '1px solid #000000', margin: '8px 0' }} />
        </>
      )}

      {/* Centered Main Title - Report 2 & 3 */}
      {(isReport2 || isReport3) && (
        <>
          <div style={{ textAlign: 'center', color: '#000', fontSize: '15pt', fontWeight: 'bold', margin: '8px 0 2px 0' }}>
            Proforma for Analysing Question Paper
          </div>
          <div style={{ textAlign: 'center', color: '#000', fontSize: '10pt', fontWeight: 'bold', margin: '2px 0 8px 0' }}>
            {isReport3 ? 'Proforma for Unit Analysis' : 'Item/Question-wise Analysis'}
          </div>
          {/* Horizontal line under main title */}
          <div style={{ borderTop: '1px solid #000000', margin: '8px 0' }} />
        </>
      )}

      {/* <div style={{ textAlign: 'center', color: '#000', fontSize: '11pt', fontWeight: 'bold', margin: '8px 0' }}>
        Part – I : General Information
      </div>
      <div style={{ borderTop: '1px solid #000000', margin: '8px 0' }} /> */}

      {/* General Information Grid - Report 1 uses the requested three-row layout. */}
      {isReport2 ? <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '30px', rowGap: '6px',
        fontSize: '11pt', margin: '10px 0', fontFamily: "'Times New Roman', Times, serif"
      }}>
        {[
          ['Name of the Board', 'Kerala Board of Public Examinations'], ['Class', classVal],
          ['Name of the Examination', 'SSLC Examination, March 2027'], ['Subject', subjectEnglish],
          ['Year of Examination', report2Header.examinationYear || yearVal], ['Maximum Time', report2Header.maximumTime || timeVal],
          ['Question Paper No./Code', report2PaperCode], ['Time Allotted', report2TimeAllotted],
          ['Sections, if any', report2Header.sections || '']
        ].map(([label, value], index) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap', gridColumn: index === 8 ? '1' : undefined }}>
            <span style={{ fontWeight: 'bold', width: '190px', flexShrink: 0 }}>{label}</span>
            <span style={{ width: '15px', flexShrink: 0 }}>:</span><span>{value}</span>
          </div>
        ))}
      </div> : <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 30px',
        fontSize: '11pt',
        margin: '10px 0',
        fontFamily: "'Times New Roman', Times, serif"
      }}>
        {isReport1 ? <>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Class</span><span style={{ width: '15px', flexShrink: 0 }}>:</span><span>{classVal}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Subject</span><span style={{ width: '15px', flexShrink: 0 }}>:</span><span>{subjectEnglish}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Time</span><span style={{ width: '15px', flexShrink: 0 }}>:</span><span>{timeVal}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Term</span><span style={{ width: '15px', flexShrink: 0 }}>:</span><span>{termVal}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Score</span><span style={{ width: '15px', flexShrink: 0 }}>:</span><span>{scoreVal}</span>
        </div>
        </> : <>
        {/* Other report headers retain their existing general information fields. */}
        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Class</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{classVal}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '170px', flexShrink: 0 }}>Subject</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{subjectEnglish}</span>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Term</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{termVal}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '170px', flexShrink: 0 }}>Year</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{yearVal}</span>
        </div>

        {/* Row 3 - SET & Question Paper Code placed below Term & Year */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>SET</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{setLetter}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '170px', flexShrink: 0 }}>Question Paper Code</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{paperCode}</span>
        </div>

        {/* Row 4 */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Time Allotted</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{timeVal}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '170px', flexShrink: 0 }}>Max. Score</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>{scoreVal}</span>
        </div>

        {/* Row 5 */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '100px', flexShrink: 0 }}>Type</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span>1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 'bold', width: '170px', flexShrink: 0 }}>Sections, if any</span>
          <span style={{ width: '15px', flexShrink: 0 }}>:</span>
          <span></span>
        </div>
        </>}
      </div>}

      {/* Horizontal line and subtitles - ONLY for Report 1 */}
      {isReport2 && !hidePart2Title && (
        <>
          <div style={{ borderTop: '1px solid #000000', margin: '8px 0' }} />
          <div style={{ textAlign: 'center', color: '#000', fontSize: '12pt', fontWeight: 'bold', margin: '8px 0' }}>
            Part – II : Item-wise Analysis
          </div>
          <div style={{ borderTop: '1px solid #000000', margin: '8px 0' }} />
        </>
      )}
      {isReport3 && (
        <>
          <div style={{ borderTop: '1px solid #000000', margin: '8px 0' }} />
          <div style={{ textAlign: 'center', color: '#000', fontSize: '12pt', fontWeight: 'bold', margin: '8px 0' }}>
            Part – II : Unit Wise Analysis
          </div>
          <div style={{ borderTop: '1px solid #000000', margin: '8px 0' }} />
        </>
      )}

    </div>
  );
};
