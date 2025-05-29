
import { EnhancedContentBlock } from "@/types/enhanced-content";

export const renderEnhancedContentBlocks = (blocks: EnhancedContentBlock[]) => {
  if (!blocks || blocks.length === 0) return '';

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return sortedBlocks.map(block => {
    switch (block.type) {
      case 'text':
        return renderTextBlock(block);
      case 'checklist':
        return renderChecklistBlock(block);
      case 'table':
        return renderTableBlock(block);
      case 'accordion':
        return renderAccordionBlock(block);
      case 'alert':
        return renderAlertBlock(block);
      default:
        return '';
    }
  }).join('');
};

const renderTextBlock = (block: any) => {
  const styleClasses = {
    highlight: 'background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px;',
    warning: 'background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 6px; padding: 12px; color: #dc2626;',
    info: 'background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 12px; color: #1d4ed8;',
    normal: 'padding: 12px;'
  };

  const style = styleClasses[block.style || 'normal'];

  return `
    <div style="${style} margin-bottom: 16px;">
      <div style="white-space: pre-wrap; line-height: 1.5;">${block.content}</div>
    </div>
  `;
};

const renderChecklistBlock = (block: any) => {
  const itemsHtml = block.items.map((item: any) => `
    <li style="margin-bottom: 8px; display: flex; align-items: center;">
      <input 
        type="checkbox" 
        ${item.completed ? 'checked' : ''} 
        style="margin-right: 8px; cursor: pointer;"
        onchange="this.parentElement.style.opacity = this.checked ? '0.7' : '1'"
      />
      <span style="line-height: 1.4; ${item.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${item.text}</span>
    </li>
  `).join('');

  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #f9fafb;">
      ${block.title ? `<h4 style="margin: 0 0 12px 0; font-weight: 600; color: #374151;">${block.title}</h4>` : ''}
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${itemsHtml}
      </ul>
    </div>
  `;
};

const renderTableBlock = (block: any) => {
  const headersHtml = block.headers.map((header: string) => 
    `<th style="padding: 12px; background-color: #f3f4f6; border-bottom: 2px solid #d1d5db; text-align: left; font-weight: 600;">${header}</th>`
  ).join('');

  const rowsHtml = block.rows.map((row: string[]) =>
    `<tr>${row.map(cell => `<td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${cell}</td>`).join('')}</tr>`
  ).join('');

  return `
    <div style="margin-bottom: 16px;">
      ${block.title ? `<h4 style="margin: 0 0 12px 0; font-weight: 600; color: #374151;">${block.title}</h4>` : ''}
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

const renderAccordionBlock = (block: any) => {
  const accordionId = `accordion-${block.id}`;
  
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; overflow: hidden;">
      <button 
        style="
          width: 100%; 
          padding: 16px; 
          background-color: #f9fafb; 
          border: none; 
          text-align: left; 
          font-weight: 600; 
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
        onclick="toggleAccordion('${accordionId}')"
      >
        ${block.title}
        <span id="${accordionId}-icon" style="transition: transform 0.3s ease;">▼</span>
      </button>
      <div 
        id="${accordionId}" 
        style="
          padding: ${block.defaultOpen ? '16px' : '0 16px'};
          max-height: ${block.defaultOpen ? 'none' : '0'};
          overflow: hidden;
          transition: all 0.3s ease;
          background-color: white;
        "
      >
        <div style="white-space: pre-wrap; line-height: 1.5; padding: ${block.defaultOpen ? '0' : '16px 0'};">
          ${block.content}
        </div>
      </div>
    </div>
    
    <script>
      function toggleAccordion(id) {
        const content = document.getElementById(id);
        const icon = document.getElementById(id + '-icon');
        const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight !== '';
        
        if (isOpen) {
          content.style.maxHeight = '0';
          content.style.padding = '0 16px';
          icon.style.transform = 'rotate(0deg)';
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.padding = '16px';
          icon.style.transform = 'rotate(180deg)';
        }
      }
    </script>
  `;
};

const renderAlertBlock = (block: any) => {
  const variants = {
    default: { bg: '#f9fafb', border: '#d1d5db', color: '#374151' },
    destructive: { bg: '#fef2f2', border: '#ef4444', color: '#dc2626' },
    warning: { bg: '#fffbeb', border: '#f59e0b', color: '#d97706' },
    info: { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8' }
  };

  const variant = variants[block.variant || 'default'];

  return `
    <div style="
      background-color: ${variant.bg};
      border: 1px solid ${variant.border};
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      color: ${variant.color};
    ">
      ${block.title ? `<h4 style="margin: 0 0 8px 0; font-weight: 600;">${block.title}</h4>` : ''}
      <div style="white-space: pre-wrap; line-height: 1.5;">${block.content}</div>
    </div>
  `;
};
