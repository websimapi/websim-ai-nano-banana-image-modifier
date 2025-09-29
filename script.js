const imageInput = document.getElementById('image-input');
const promptInput = document.getElementById('prompt-input');
const generateButton = document.getElementById('generate-button');
const loadingIndicator = document.getElementById('loading');
const originalImagePreview = document.getElementById('original-image-preview');
const modifiedImageOutput = document.getElementById('modified-image-output');
const originalPlaceholder = document.getElementById('original-placeholder');
const modifiedPlaceholder = document.getElementById('modified-placeholder');

let imageDataUrl = null;
let promptText = '';

// Helper function to handle UI state changes
function setAppState(isLoading) {
    const isReady = imageDataUrl && promptText.length > 0;
    generateButton.disabled = isLoading || !isReady;
    loadingIndicator.classList.toggle('hidden', !isLoading);
    promptInput.disabled = isLoading;
    imageInput.disabled = isLoading;
    generateButton.textContent = isLoading ? 'Processing...' : '3. Modify Image';
}

// Read the uploaded file and set up the preview
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageDataUrl = e.target.result;
            
            originalImagePreview.src = imageDataUrl;
            originalImagePreview.classList.remove('hidden');
            originalPlaceholder.classList.add('hidden');
            
            // Enable the button if we have an image AND a prompt
            setAppState(false);

            // Clear previous modification result
            modifiedImageOutput.src = "";
            modifiedImageOutput.classList.add('hidden');
            modifiedPlaceholder.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        imageDataUrl = null;
        originalImagePreview.src = "";
        originalImagePreview.classList.add('hidden');
        originalPlaceholder.classList.remove('hidden');
        setAppState(false);
    }
});

// Track prompt input for button enabling
promptInput.addEventListener('input', () => {
    promptText = promptInput.value.trim();
    setAppState(false);
});

// Main generation logic
generateButton.addEventListener('click', async () => {
    if (!imageDataUrl || promptText === '') {
        alert('Please upload an image and provide a modification prompt.');
        return;
    }

    const prompt = promptText;
    setAppState(true);
    
    modifiedImageOutput.classList.add('hidden');
    modifiedPlaceholder.textContent = 'AI is modifying the image...';
    modifiedPlaceholder.classList.remove('hidden');

    try {
        // Call the AI Image Generation API
        const result = await websim.imageGen({
            prompt: prompt,
            image_inputs: [
                {
                    url: imageDataUrl,
                },
            ],
            // We use the aspect ratio of the input image for the output
            // (The AI automatically handles aspect ratio matching based on the input image)
        });

        if (result && result.url) {
            modifiedImageOutput.src = result.url;
            modifiedImageOutput.classList.remove('hidden');
            modifiedPlaceholder.classList.add('hidden');
        } else {
            throw new Error("AI returned no image URL.");
        }

    } catch (error) {
        console.error("Image generation failed:", error);
        modifiedPlaceholder.textContent = `Error: Image modification failed. (${error.message || 'Check console.'})`;
    } finally {
        setAppState(false);
    }
});

// Initial state setup
setAppState(false);