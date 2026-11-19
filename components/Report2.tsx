import React from 'react';
import { Blueprint, CognitiveProcess, KnowledgeLevel, ItemFormat } from '../types';
import { ReportHeader } from './reports/ReportHeader';
import { 
    formatMark,
    normalizeCPValue,
    normalizeLevelValue,
    normalizeFormatValue,
    cpDefinitions,
    levelDefinitions,
    formatDefinitions
} from '../services/reportUtils';
import { ReportData } from '../hooks/useReportData';

interface Report2Props {
    blueprint: Blueprint;
    data: ReportData;
}

/**
 * Report2: Item-wise Analysis
 * 
 * Features:
 * - Unified rendering for Print and Export
 * - Native table splitting with repeating headers
 * - Expanded widths for columns 2-4 and fit-content widths for columns 5-end
 */
export const Report2: React.FC<Report2Props> = ({ blueprint, data }) => {
    const { itemRows } = data;

    const settings = React.useMemo(() => {
        const defaultSettings = {
            fontFamily: 'TAU-Paalai',
            fontFamilyEnglish: 'Times New Roman',
            fontSizeTamil: 7,
            fontSizeEnglish: 10,
            fontSizeBody: 10,
        };

        let localSettings: any = {};
        try {
            const stored = localStorage.getItem(`bp_settings_${blueprint.id}_report2`);
            if (stored) localSettings = JSON.parse(stored);
        } catch (e) { }

        const perReport = (blueprint.perReportSettings?.report2 || {}) as any;
        const globalSettings = blueprint.reportSettings || {};

        return {
            ...defaultSettings,
            ...globalSettings,
            ...perReport,
            ...localSettings
        };
    }, [blueprint]);

    const renderQNo = (qNo: string) => {
        if (qNo.includes('(அ)')) {
            const num = qNo.replace('(அ)', '');
            return (
                <div style={{ lineHeight: '1.1' }}>
                    {num}
                    <br />
                    (அ)
                </div>
            );
        }
        if (qNo.includes('(ஆ)')) {
            const num = qNo.replace('(ஆ)', '');
            return (
                <div style={{ lineHeight: '1.1' }}>
                    {num}
                    <br />
                    (ஆ)
                </div>
            );
        }
        return qNo;
    };

    // Aggregates for bottom total rows (summing Option A properties of blueprint.items only, ensuring internal choice counts as 1 item)
    const columnTotals = React.useMemo(() => {
        const counts = {
            cp: { CP1: 0, CP2: 0, CP3: 0, CP4: 0, CP5: 0, CP6: 0 },
            levels: { B: 0, A: 0, P: 0 },
            formats: { SR1: 0, SR2: 0, CRS1: 0, CRS2: 0, CRL: 0 }
        };
        const scores = {
            cp: { CP1: 0, CP2: 0, CP3: 0, CP4: 0, CP5: 0, CP6: 0 },
            levels: { B: 0, A: 0, P: 0 },
            formats: { SR1: 0, SR2: 0, CRS1: 0, CRS2: 0, CRL: 0 }
        };
        let grandTime = 0;
        let grandItems = 0;
        let grandScore = 0;

        if (blueprint && blueprint.items) {
            blueprint.items.forEach(item => {
                const score = item.marksPerQuestion * item.questionCount;
                
                const normCP = normalizeCPValue(item.cognitiveProcess as string) as CognitiveProcess;
                const cpKey = cpDefinitions.find(d => d.value === normCP)?.key;
                
                const normKL = normalizeLevelValue(item.knowledgeLevel as string) as KnowledgeLevel;
                const klKey = levelDefinitions.find(d => d.value === normKL)?.key;
                
                const normFmt = normalizeFormatValue(item.itemFormat as string) as ItemFormat;
                const fmtKey = formatDefinitions.find(d => d.value === normFmt)?.key;

                if (cpKey && cpKey !== 'CP7') {
                    counts.cp[cpKey as keyof typeof counts.cp] += item.questionCount;
                    scores.cp[cpKey as keyof typeof scores.cp] += score;
                }
                if (klKey) {
                    counts.levels[klKey as keyof typeof counts.levels] += item.questionCount;
                    scores.levels[klKey as keyof typeof scores.levels] += score;
                }
                if (fmtKey) {
                    counts.formats[fmtKey as keyof typeof counts.formats] += item.questionCount;
                    scores.formats[fmtKey as keyof typeof scores.formats] += score;
                }

                grandTime += (item.time || 0);
                grandItems += item.questionCount;
                grandScore += score;
            });
        }

        return { counts, scores, grandTime, grandItems, grandScore };
    }, [blueprint]);

    const groupedItemRows = React.useMemo(() => {
        const groups: (typeof itemRows)[] = [];
        let currentGroup: typeof itemRows = [];

        itemRows.forEach(row => {
            if (row.isChoiceB) {
                currentGroup.push(row);
                groups.push(currentGroup);
                currentGroup = [];
            } else if (row.isChoiceA) {
                if (currentGroup.length > 0) {
                    groups.push(currentGroup);
                }
                currentGroup = [row];
            } else {
                if (currentGroup.length > 0) {
                    groups.push(currentGroup);
                    currentGroup = [];
                }
                groups.push([row]);
            }
        });
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }
        return groups;
    }, [itemRows]);

    // Fixed percentages add to 100% on the landscape page's printable width.
    // The compact rubric columns retain enough room for values such as 3(12).
    const textColWidths = {
        qNo: '3%',
        lo: '22%',
        unit: '16%',
        subTopic: '16%',
        kl: '4%',
        format: '4%',
        score: '5%',
        time: '6%'
    };

    const cellStyle = "border border-black p-0.5 text-center english-font";
    const headerStyle = "border border-black p-0.5 text-center font-bold bg-transparent";
    
    // Fit-to-content style for columns 5 to end
    const compactDataCellStyle: React.CSSProperties = { 
        width: textColWidths.kl,
        paddingLeft: '3px', 
        paddingRight: '3px', 
        whiteSpace: 'nowrap', 
        textAlign: 'center' 
    };

    return (
        <div className="report2-container w-full">
            <div className="report-page bg-white p-[15mm] print:p-0 text-black shadow-lg mx-auto relative landscape"
                 style={{ width: '297mm', boxSizing: 'border-box' }}>
                <div style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    <ReportHeader blueprint={blueprint} sectionTitle="PART – II : ITEM-WISE ANALYSIS" orientation="landscape" />
                </div>
                <table className="w-full border-collapse border-2 border-black leading-tight mt-2" 
                       style={{ tableLayout: 'fixed', width: '100%', pageBreakBefore: 'avoid', breakBefore: 'avoid' }}>
                    <colgroup>
                        <col style={{ width: textColWidths.qNo }} />
                        <col style={{ width: textColWidths.lo }} />
                        <col style={{ width: textColWidths.unit }} />
                        <col style={{ width: textColWidths.subTopic }} />
                        {[0, 1, 2].map(i => <col key={`kl-${i}`} style={{ width: textColWidths.kl }} />)}
                        {[0, 1, 2, 3, 4].map(i => <col key={`fmt-${i}`} style={{ width: textColWidths.format }} />)}
                        <col style={{ width: textColWidths.score }} />
                        <col style={{ width: textColWidths.time }} />
                    </colgroup>
                    <thead>
                        <tr className="bg-transparent">
                            <th rowSpan={2} className="border border-black p-1 font-bold" style={{ width: textColWidths.qNo, whiteSpace: 'nowrap' }}>Qn</th>
                            <th colSpan={3} className="border border-black p-1 font-bold">Content Area</th>
                            
                            <th colSpan={3} className="border border-black p-1 font-bold">Knowledge Level</th>
                            <th colSpan={5} className="border border-black p-1 font-bold">Item Format</th>
                            
                            <th rowSpan={2} className="border border-black p-1 font-bold" style={{ ...compactDataCellStyle, width: textColWidths.score, writingMode: 'vertical-rl', transform: 'rotate(180deg)', verticalAlign: 'middle' }}>Score</th>
                            <th rowSpan={2} className="border border-black p-1 font-bold" style={{ ...compactDataCellStyle, width: textColWidths.time, writingMode: 'vertical-rl', transform: 'rotate(180deg)', verticalAlign: 'middle' }}>Time</th>
                        </tr>
                        <tr className="bg-transparent">
                            <th className={headerStyle} style={{ width: textColWidths.lo }}>Learning Objective</th>
                            <th className={headerStyle} style={{ width: textColWidths.unit }}>Topic / Unit / Chapter</th>
                            <th className={headerStyle} style={{ width: textColWidths.subTopic }}>Sub Topic</th>
                            {['B', 'A', 'P'].map(kl => <th key={kl} className={headerStyle} style={{ ...compactDataCellStyle, width: textColWidths.kl }}>{kl}</th>)}
                            {['SR1', 'SR2', 'CRS1', 'CRS2', 'CRL'].map(fmt => <th key={fmt} className={headerStyle} style={{ ...compactDataCellStyle, width: textColWidths.format }}>{fmt}</th>)}
                        </tr>
                    </thead>
                    {groupedItemRows.map((group, gIdx) => (
                        <tbody key={gIdx} className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            {group.map((row, idx) => (
                                <tr key={idx} className="bg-transparent avoid-break">
                                    <td className="border border-black p-0.5 text-center font-bold english-font" style={{ width: textColWidths.qNo, whiteSpace: 'nowrap' }}>{renderQNo(row.qNo)}</td>
                                    <td className="border border-black p-1 text-left leading-tight tamil-font" 
                                        style={{ 
                                            width: textColWidths.lo,
                                            wordBreak: 'normal', 
                                            overflowWrap: 'break-word', 
                                            whiteSpace: 'normal',
                                            lineBreak: 'strict'
                                        }}>
                                        {row.learningObjective}
                                    </td>
                                    <td className="border border-black p-1 text-left leading-tight tamil-font" 
                                        style={{ width: textColWidths.unit, wordBreak: 'normal', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                                        {row.unit}
                                    </td>
                                    <td className="border border-black p-1 text-left leading-tight tamil-font" 
                                        style={{ width: textColWidths.subTopic, wordBreak: 'normal', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                                        {row.subTopic}
                                    </td>
                                    
                                    {/* KL Columns (5 to 7) */}
                                    <td style={compactDataCellStyle} className={`${cellStyle} font-bold`}>{row.kl.basic}</td>
                                    <td style={compactDataCellStyle} className={`${cellStyle} font-bold`}>{row.kl.average}</td>
                                    <td style={compactDataCellStyle} className={`${cellStyle} font-bold`}>{row.kl.profound}</td>

                                    {/* Format Columns (8 to 12) */}
                                    <td style={compactDataCellStyle} className={cellStyle}>{row.fmt.SR1}</td>
                                    <td style={compactDataCellStyle} className={cellStyle}>{row.fmt.SR2}</td>
                                    <td style={compactDataCellStyle} className={cellStyle}>{row.fmt.CRS1}</td>
                                    <td style={compactDataCellStyle} className={cellStyle}>{row.fmt.CRS2}</td>
                                    <td style={compactDataCellStyle} className={cellStyle}>{row.fmt.CRL}</td>

                                    {/* Score & Time Columns (13 & 14) */}
                                    {!row.isChoiceB && (
                                        <>
                                            <td rowSpan={row.isChoiceA ? 2 : 1} style={compactDataCellStyle} className={`${cellStyle} font-black bg-transparent`}>{formatMark(row.score)}</td>
                                            <td rowSpan={row.isChoiceA ? 2 : 1} style={compactDataCellStyle} className={cellStyle}>{row.time}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    ))}

                    {/* Total Item and Total Score */}
                    <tbody className="avoid-break font-bold" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        {/* Total Item Row */}
                        <tr className="bg-transparent font-bold avoid-break" style={{ height: '36px' }}>
                            <td colSpan={4} className="border border-black p-2.5 text-center font-bold">Total Item</td>
                            
                            {/* Level Item Totals */}
                            {['B', 'A', 'P'].map(kl => (
                                <td key={kl} style={compactDataCellStyle} className="border border-black p-0.5 text-center english-font font-bold">
                                    {columnTotals.counts.levels[kl as keyof typeof columnTotals.counts.levels] || ''}
                                </td>
                            ))}

                            {/* Format Item Totals */}
                            {['SR1', 'SR2', 'CRS1', 'CRS2', 'CRL'].map(fmt => (
                                <td key={fmt} style={compactDataCellStyle} className="border border-black p-0.5 text-center english-font font-bold">
                                    {columnTotals.counts.formats[fmt as keyof typeof columnTotals.counts.formats] || ''}
                                </td>
                            ))}

                            {/* Score cell is empty in Total Item row */}
                            <td style={compactDataCellStyle} className="border border-black bg-transparent"></td>

                            {/* Answering Time Grand Total */}
                            <td style={compactDataCellStyle} className="border border-black p-1 text-center english-font font-bold">
                                {columnTotals.grandTime || ''}
                            </td>
                        </tr>

                        {/* Total Score Row */}
                        <tr className="bg-transparent font-bold avoid-break" style={{ height: '36px' }}>
                            <td colSpan={4} className="border border-black p-2.5 text-center font-bold">Total Score</td>
                            
                            {/* Level Score Totals */}
                            {['B', 'A', 'P'].map(kl => (
                                <td key={kl} style={compactDataCellStyle} className="border border-black p-0.5 text-center english-font font-bold">
                                    {columnTotals.scores.levels[kl as keyof typeof columnTotals.scores.levels] || ''}
                                </td>
                            ))}

                            {/* Format Score Totals */}
                            {['SR1', 'SR2', 'CRS1', 'CRS2', 'CRL'].map(fmt => (
                                <td key={fmt} style={compactDataCellStyle} className="border border-black p-0.5 text-center english-font font-bold">
                                    {columnTotals.scores.formats[fmt as keyof typeof columnTotals.scores.formats] || ''}
                                </td>
                            ))}

                            {/* Total Score Grand Total */}
                            <td style={compactDataCellStyle} className="border border-black p-1 text-center english-font font-black">
                                {formatMark(columnTotals.grandScore)}
                            </td>

                            {/* Answering Time cell is empty in Total Score row */}
                            <td style={compactDataCellStyle} className="border border-black bg-transparent"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .font-report {
                    font-family: '${settings.fontFamilyEnglish || 'Times New Roman'}', serif !important;
                }
                .tamil-font {
                    font-family: '${settings.fontFamily || 'TAU-Paalai'}', serif !important;
                    font-size: ${settings.fontSizeTamil || 7}pt !important;
                    line-height: 1.1 !important;
                }
                .english-font {
                    font-family: '${settings.fontFamilyEnglish || 'Times New Roman'}', serif !important;
                    font-size: ${settings.fontSizeEnglish || settings.fontSizeBody || 10}pt !important;
                }
                
                /* Dynamic font size for English elements in Report 2 */
                .report2-container,
                .report2-container table,
                .report2-container th,
                .report2-container td,
                .report2-container div,
                .report2-container span,
                .report2-container p,
                .report2-container h3 {
                    font-size: ${settings.fontSizeEnglish || settings.fontSizeBody || 10}pt;
                }
                
                /* Override tailwind text-[10pt] and text-[7pt] classes */
                .report2-container .text-\\[10pt\\] {
                    font-size: ${settings.fontSizeEnglish || settings.fontSizeBody || 10}pt !important;
                }
                .report2-container .text-\\[7pt\\] {
                    font-size: ${settings.fontSizeTamil || 7}pt !important;
                }
                
                /* Ensure specific elements like headers scale too */
                .report2-container th, 
                .report2-container td {
                    font-size: ${settings.fontSizeEnglish || settings.fontSizeBody || 10}pt;
                }
                .report2-container td.tamil-font {
                    font-size: ${settings.fontSizeTamil || 7}pt !important;
                }

                @media print {
                    .report-page {
                        box-shadow: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                        min-height: 0 !important;
                        height: auto !important;
                        page-break-after: auto !important;
                        page-break-inside: auto !important;
                        break-after: auto !important;
                    }
                    thead {
                        display: table-header-group !important;
                    }
                    tr, tbody.avoid-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    table {
                        page-break-inside: auto !important;
                    }
                    .tamil-font {
                        font-family: '${settings.fontFamily || 'TAU-Paalai'}', serif !important;
                        font-size: ${settings.fontSizeTamil || 7}pt !important;
                        line-height: 1.1 !important;
                    }
                }
            ` }} />
        </div>
    );
};
