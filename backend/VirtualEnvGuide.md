# Setting Up Virtual Environment for the Project

Follow the steps below to set up a virtual environment and install the necessary dependencies for this project.

---

## **1. Prerequisites**

Make sure you have **Python 3.11.5** installed. You can verify your Python version with:

```bash
python --version
```

If you are using **pyenv** to manage Python versions, set it up as follows:

```bash
pyenv global 3.11.5
pyenv local 3.11.5
exec "$SHELL"
```

---

## **2. Creating and Activating a Virtual Environment**

### **Step 1: Create the Virtual Environment**

In your project directory, create a new virtual environment named `venv`:

```bash
python -m venv venv
```

### **Step 2: Activate the Virtual Environment**

- **On Windows:**

```bash
venv\Scripts\activate
uvicorn main:app --reload
```

- **On macOS/Linux:**

```bash
source venv/bin/activate
```

Once activated, your terminal will display `(venv)` at the beginning of the prompt.

---

## **3. Installing Dependencies**

### **Step 1: Install Packages from `requirements.txt`**

Ensure your virtual environment is activated, then run:

```bash
pip install -r requirements.txt

# if error occurs, try
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install transformers accelerate
pip uninstall bitsandbytes



```

### **Step 2: Install Additional Packages (if not included in `requirements.txt`)**

Some additional libraries may not be listed in the `requirements.txt` but are needed for the project:

```bash
pip install langchain langchain-ollama bitsandbytes accelerate peft transformers ninja cmake torch
```

---

## **4. Running the Application**

### **Start the FastAPI Server**

Once all dependencies are installed, you can run the FastAPI application using **uvicorn**:

```bash
uvicorn main:app --reload
python -m uvicorn main:app --reload
```

- Visit `http://127.0.0.1:8000` in your browser to access the API.
- Use `http://127.0.0.1:8000/docs` to view the interactive Swagger API documentation.

---

## **5. Deactivating the Virtual Environment**

After you're done working on the project, deactivate the virtual environment with:

```bash
deactivate
```

---

## **6. Troubleshooting**

- **Issue:** *Module not found errors.*  
  **Solution:** Ensure the virtual environment is activated before running any commands.

- **Issue:** *Package version conflicts.*  
  **Solution:** Update `requirements.txt` to specify compatible versions and reinstall dependencies:

  ```bash
  pip freeze > requirements.txt
  pip install -r requirements.txt
  ```

---

This guide should help you set up the environment smoothly. For further issues, refer to the official documentation of the respective libraries.

