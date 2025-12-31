import html2pdf from "html2pdf.js";

export async function generatePdf(element: HTMLElement, fileName: string) {
    // Create a new wrapper with the element's HTML content
    const wrapper = document.createElement('div');
    wrapper.innerHTML = element.innerHTML;
    wrapper.style.width = '100%';
    wrapper.style.height = 'auto';

    // Copy input/textarea values from original element to wrapper
    const originalInputs = element.querySelectorAll('input, textarea');
    const wrapperInputs = wrapper.querySelectorAll('input, textarea');
    originalInputs.forEach((originalInput, index) => {
        const wrapperInput = wrapperInputs[index] as HTMLInputElement | HTMLTextAreaElement;
        if (wrapperInput) {
            wrapperInput.value = (originalInput as HTMLInputElement | HTMLTextAreaElement).value;
        }
    });

    // Override styles for PDF rendering
    const allElements = wrapper.querySelectorAll('*');
    for (const el of allElements) {
        const htmlEl = el as HTMLElement;

        // Skip styling SVG elements and icon containers to preserve positioning
        if (htmlEl.tagName === 'SVG' || htmlEl.classList.contains('icon')) {
            continue;
        }

        // Apply styles to improve PDF appearance
        htmlEl.style.color = '#000000';
        htmlEl.style.backgroundColor = 'transparent';
        htmlEl.style.borderColor = '#000000';
        htmlEl.style.maxHeight = 'none';

        // Text adjustments for better readability
        htmlEl.style.wordSpacing = '-0.1em';
        htmlEl.style.letterSpacing = '0.05em';
        htmlEl.style.whiteSpace = 'normal';
        htmlEl.style.wordBreak = 'break-word';

        // Handle elements with scrollbars and make them fully visible
        if (htmlEl.classList.contains('hide-scroll')) {
            htmlEl.style.overflow = 'visible';
            htmlEl.style.height = 'auto';
        }
    }

    // Returns the PDF as a Blob so it can be downloaded
    return new Promise<Blob>((resolve, reject) => {
        html2pdf()
            .set({
                margin: 10,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCors: true, allowTaint: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(wrapper)
            .output('blob')
            .then((blob: Blob) => resolve(blob))
            .catch((error: any) => reject(error));
    });
}