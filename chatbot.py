import streamlit as st
from llama_cpp import Llama

# 1. Page Configuration
st.set_page_config(page_title="Malaysian Multi-Lingual AI Translator", page_icon="🇲🇾", layout="centered")
st.title("🇲🇾 Local Multi-Lingual AI Translator")
st.caption("Supports English, Malay, Tamil, and Mandarin using your local RTX 4050 GPU")

# 2. Cache the model to memory
@st.cache_resource
def load_model():
    return Llama.from_pretrained(
        repo_id="mradermacher/Malaysian-gemma-3-1b-it-GGUF",
        filename="Malaysian-gemma-3-1b-it.Q4_K_M.gguf",
        n_gpu_layers=-1,  # Offload all layers to your RTX 4050
        n_ctx=2048
    )

llm = load_model()

# 3. User Interface Inputs
user_input = st.text_area("Enter the text you want to translate:", placeholder="Type your text here...")

# Language Selection Row
col1, col2 = st.columns(2)

with col1:
    source_lang = st.selectbox(
        "Detect/Select Source Language:",
        ["Auto-Detect", "English", "Malay (Bahasa Melayu)", "Mandarin (中文)", "Tamil (தமிழ்)"]
    )

with col2:
    target_lang = st.selectbox(
        "Select Target Output Language:",
        ["Malay (Bahasa Melayu)", "English", "Mandarin (中文)", "Tamil (தமிழ்)"]
    )

# 4. Translation Execution Logic
if st.button("TRANSLATE", type="primary"):
    if not user_input.strip():
        st.warning("Please enter some text first!")
    else:
        # Construct an absolute, unyielding prompt structure for cross-lingual accuracy
        prompt = f"""<start_of_turn>user
[SYSTEM DIRECTION: YOU ARE A PROFESSIONAL MULTILINGUAL TRANSLATOR. CRITICAL CONSTRAINT: YOU MUST OUTPUT THE TRANSLATION EXCLUSIVELY IN THE REQUESTED TARGET LANGUAGE AND ITS NATIVE SCRIPT. DO NOT USE ANY OTHER LANGUAGES IN YOUR RESPONSE.]

Task Instructions:
- Source Language: {source_lang}
- Target Language: {target_lang}
- Instruction: Translate the text below accurately. Provide ONLY the raw text translation. Do not write explanations, notes, or introductions.

Input text to translate:
"{user_input}"
<end_of_turn>
<start_of_turn>model
"""
        
        # Run local GPU execution
        with st.spinner(f"Translating into {target_lang}..."):
            response = llm(
                prompt,
                max_tokens=512,
                temperature=0.1,  # Forces strict, literal token selection
                stop=["<end_of_turn>"]
            )
            
            # Extract and display the corrected list-index array result
            translated_text = response["choices"][0]["text"].strip()
            
            st.success(f"### Translation ({target_lang}):")
            st.write(translated_text)
