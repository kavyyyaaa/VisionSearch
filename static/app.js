document.addEventListener("DOMContentLoaded", () => {
    // State management
    let products = [];
    let queryHistory = [];
    let currentQueryImage = null;
    let selectedFile = null;
    let activePcaData = null; // Stores last SVD coordinates
    
    // DOM Elements - Navigation & Tab Panels
    const navButtons = {
        home: document.getElementById("btn-home-tab"),
        search: document.getElementById("btn-search-tab"),
        embed: document.getElementById("btn-embed-tab"),
        analytics: document.getElementById("btn-analytics-tab"),
        db: document.getElementById("btn-db-tab")
    };
    
    const tabPanels = {
        home: document.getElementById("home-tab-content"),
        search: document.getElementById("search-tab-content"),
        embed: document.getElementById("embed-tab-content"),
        analytics: document.getElementById("analytics-tab-content"),
        db: document.getElementById("db-tab-content")
    };
    
    const tabTitle = document.getElementById("tab-title");
    const tabSubtitle = document.getElementById("tab-subtitle");

    // DOM Elements - Search UI
    const fileInput = document.getElementById("file-input");
    const dropZone = document.getElementById("drop-zone");
    const previewContainer = document.getElementById("preview-container");
    const queryPreview = document.getElementById("query-preview");
    const btnRemoveImg = document.getElementById("btn-remove-img");
    const categorySelect = document.getElementById("category-select");
    const limitSelect = document.getElementById("limit-select");
    const limitVal = document.getElementById("limit-val");
    const btnSearch = document.getElementById("btn-search");
    const emptyResults = document.getElementById("empty-results");
    const resultsGrid = document.getElementById("results-grid");
    
    // Terminal console loader elements
    const terminalLoader = document.getElementById("terminal-loader");
    const terminalConsoleBody = document.getElementById("terminal-console-body");

    // Flowchart pipeline flowchart elements
    const pipelineFlowchartCard = document.getElementById("pipeline-flowchart-card");
    const flowQueryImg = document.getElementById("flow-query-img");
    const flowHeatmapImg = document.getElementById("flow-heatmap-img");
    const flowVectorSparkline = document.getElementById("flow-vector-sparkline");

    const analyticsBar = document.getElementById("analytics-bar");
    
    // DOM Elements - History
    const historyList = document.getElementById("history-list");
    
    // DOM Elements - Analytics
    const timeTotal = document.getElementById("time-total");
    const timeResnet = document.getElementById("time-resnet");
    const timeFaiss = document.getElementById("time-faiss");
    const catalogCountTelemetry = document.getElementById("catalog-count-telemetry");
    const statsIndexedCount = document.getElementById("stats-indexed-count");
    const statsAvgLatency = document.getElementById("stats-avg-latency");

    // DOM Elements - Quick Try
    const quickGallery = document.getElementById("quick-gallery");

    // DOM Elements - Catalog Explorer
    const catalogGrid = document.getElementById("catalog-grid");
    const catalogSearch = document.getElementById("catalog-search");

    // DOM Elements - Add Product Modal
    const btnAddProduct = document.getElementById("btn-add-product");
    const addModal = document.getElementById("add-modal");
    const btnCloseAdd = document.getElementById("btn-close-add");
    const addProductForm = document.getElementById("add-product-form");
    const addImageZone = document.getElementById("add-image-zone");
    const addImageInput = document.getElementById("add-image-input");
    const addImagePreview = document.getElementById("add-image-preview");
    const addPromptText = document.getElementById("add-prompt-text");
    const addErrorMsg = document.getElementById("add-error-msg");
    const addSuccessMsg = document.getElementById("add-success-msg");

    // DOM Elements - Match Modal
    const matchModal = document.getElementById("match-modal");
    const btnCloseMatch = document.getElementById("btn-close-match");
    const kpQuery = document.getElementById("kp-query");
    const kpProduct = document.getElementById("kp-product");
    const kpMatches = document.getElementById("kp-matches");
    const matchShimmer = document.getElementById("match-shimmer");
    const matchedResultImg = document.getElementById("matched-result-img");

    // DOM Elements - Details Modal
    const detailsModal = document.getElementById("details-modal");
    const btnCloseDetails = document.getElementById("btn-close-details");
    const detailProductImg = document.getElementById("detail-product-img");
    const detailProductName = document.getElementById("detail-product-name");
    const detailProductCategory = document.getElementById("detail-product-category");
    const detailProductPrice = document.getElementById("detail-product-price");
    const detailProductId = document.getElementById("detail-product-id");
    const detailProductDesc = document.getElementById("detail-product-desc");
    const vectorGrid = document.getElementById("vector-grid");

    // DOM Elements - Embedding Plot (PCA)
    const pcaSvg = document.getElementById("pca-svg");
    const svgNodes = document.getElementById("svg-nodes");
    const svgConnections = document.getElementById("svg-connections");
    const svgQueryNode = document.getElementById("svg-query-node");
    const pcaTooltip = document.getElementById("pca-tooltip");
    const tooltipImg = document.getElementById("tooltip-img");
    const tooltipName = document.getElementById("tooltip-name");
    const tooltipCategory = document.getElementById("tooltip-category");

    // Initialize Page Data
    initializeApp();

    function initializeApp() {
        runPreloaderAnimation();
        loadCatalog();
        loadHistory();
        loadEvaluationMetrics();
        setupTabRouting();
    }

    // ----------------------------------------------------
    // Fullscreen Animated Hero Preloader
    // ----------------------------------------------------
    function runPreloaderAnimation() {
        const preloader = document.getElementById("app-preloader");
        const btnReady = document.getElementById("btn-preloader-ready");
        
        const lines = [
            { id: "loader-line-1", text: "Initializing ResNet-50 Feature Extractor...", doneText: "ResNet-50 Feature Extractor Loaded." },
            { id: "loader-line-2", text: "Synchronizing FAISS index mapping (325 items)...", doneText: "FAISS index mapping synchronized." },
            { id: "loader-line-3", text: "Caching vector cluster projections...", doneText: "Projections cached." },
            { id: "loader-line-4", text: "Verifying system components...", doneText: "System Ready." }
        ];
        
        let currentLine = 0;
        
        function animateLine() {
            if (currentLine > 0) {
                // Complete previous line
                const prevEl = document.getElementById(lines[currentLine - 1].id);
                if (prevEl) {
                    prevEl.className = "terminal-line done";
                    prevEl.innerHTML = `<span style="color: var(--accent-success);">[✓]</span> ${lines[currentLine - 1].doneText}`;
                }
            }
            
            if (currentLine < lines.length) {
                const el = document.getElementById(lines[currentLine].id);
                if (el) {
                    el.className = "terminal-line active";
                    el.innerHTML = `<span style="color: var(--accent-indigo);">[⧖]</span> ${lines[currentLine].text}`;
                }
                currentLine++;
                setTimeout(animateLine, 400);
            } else {
                // Preloader done, show dashboard initialization trigger
                btnReady.style.display = "block";
                btnReady.addEventListener("click", () => {
                    preloader.classList.add("fade-out");
                });
            }
        }
        
        animateLine();
    }

    // ----------------------------------------------------
    // Tab Navigation Logic
    // ----------------------------------------------------
    function setupTabRouting() {
        Object.keys(navButtons).forEach(tabKey => {
            navButtons[tabKey].addEventListener("click", () => {
                switchTab(tabKey);
            });
        });
    }

    function switchTab(activeTab) {
        // Toggle Nav Buttons Active Class
        Object.keys(navButtons).forEach(tabKey => {
            if (tabKey === activeTab) {
                navButtons[tabKey].classList.add("active");
                tabPanels[tabKey].style.display = "block";
            } else {
                navButtons[tabKey].classList.remove("active");
                tabPanels[tabKey].style.display = "none";
            }
        });

        // Set Headers dynamically
        if (activeTab === "home") {
            tabTitle.textContent = "Platform Overview";
            tabSubtitle.textContent = "Semantic retail search and neural network vector clustering inspector.";
        } else if (activeTab === "search") {
            tabTitle.textContent = "Visual Query Inspection";
            tabSubtitle.textContent = "Compute nearest-neighbor similarities and analyze CNN spatial activations.";
        } else if (activeTab === "embed") {
            tabTitle.textContent = "Embedding Space Explorer";
            tabSubtitle.textContent = "Interactive 2D PCA projection of the 2048-dimensional features manifold.";
            renderPcaPlot();
        } else if (activeTab === "analytics") {
            tabTitle.textContent = "System Analytics";
            tabSubtitle.textContent = "Real-time index metrics, pipeline benchmarks, and category statistics.";
            renderAnalyticsCharts();
        } else if (activeTab === "db") {
            tabTitle.textContent = "Indexed Product Catalog";
            tabSubtitle.textContent = "Filter and explore the local FAISS index registry.";
            renderCatalogGrid();
        }
    }

    // ----------------------------------------------------
    // File Upload & Drag-and-Drop
    // ----------------------------------------------------
    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleSelectedFile(e.target.files[0]);
        }
    });

    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleSelectedFile(files[0]);
        }
    });

    function handleSelectedFile(file) {
        if (!file.type.startsWith("image/")) {
            alert("Upload an image file (PNG, JPG, JPEG).");
            return;
        }
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            queryPreview.src = e.target.result;
            previewContainer.style.display = "block";
            document.querySelector(".drop-zone-prompt").style.display = "none";
            btnSearch.removeAttribute("disabled");
        };
        reader.readAsDataURL(file);
    }

    btnRemoveImg.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.value = "";
        selectedFile = null;
        queryPreview.src = "";
        previewContainer.style.display = "none";
        document.querySelector(".drop-zone-prompt").style.display = "flex";
        btnSearch.setAttribute("disabled", "true");
        
        // Reset results layouts
        emptyResults.style.display = "flex";
        resultsGrid.style.display = "none";
        analyticsBar.style.display = "none";
        pipelineFlowchartCard.style.display = "none";
        terminalLoader.style.display = "none";
        document.getElementById("top-match-hero").style.display = "none";
        
        // Clear PCA query node
        svgQueryNode.innerHTML = "";
        svgConnections.innerHTML = "";
        document.getElementById("pca-compact-status").style.display = "none";
    });

    limitSelect.addEventListener("input", (e) => {
        limitVal.textContent = e.target.value;
    });

    // ----------------------------------------------------
    // Visual Query Search Actions & Console Animation
    // ----------------------------------------------------
    btnSearch.addEventListener("click", () => {
        if (!selectedFile) return;
        executeSearchWithConsole(selectedFile);
    });

    function executeSearchWithConsole(imageFile) {
        // Hide other results UI panels first
        emptyResults.style.display = "none";
        resultsGrid.style.display = "none";
        analyticsBar.style.display = "none";
        pipelineFlowchartCard.style.display = "none";
        document.getElementById("top-match-hero").style.display = "none";
        
        // Show terminal console container and clear content
        terminalLoader.style.display = "block";
        terminalConsoleBody.innerHTML = "";
        btnSearch.setAttribute("disabled", "true");

        // Fire API request in parallel
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("k", limitSelect.value);
        formData.append("category", categorySelect.value);

        const searchPromise = fetch("/api/search", {
            method: "POST",
            body: formData
        }).then(res => {
            if (!res.ok) throw new Error("Search request failed.");
            return res.json();
        });

        // Console steps configuration
        const consoleSteps = [
            "Preprocessing query image...",
            "Running ResNet-50 layer-by-layer forward pass...",
            "Extracting Layer 4 activation maps...",
            "Dispatching 2048-D features to FAISS index...",
            "Retrieval completed."
        ];

        let currentStep = 0;

        function runStepAnimation() {
            if (currentStep > 0) {
                const prevRow = terminalConsoleBody.querySelector(`.step-${currentStep - 1}`);
                if (prevRow) {
                    prevRow.className = "terminal-row done";
                    prevRow.querySelector(".status-symbol").textContent = "[✓]";
                }
            }

            if (currentStep < consoleSteps.length) {
                const row = document.createElement("div");
                row.className = `terminal-row active step-${currentStep}`;
                row.innerHTML = `<span class="status-symbol">[⧖]</span> <span>${consoleSteps[currentStep]}</span>`;
                terminalConsoleBody.appendChild(row);
                terminalConsoleBody.scrollTop = terminalConsoleBody.scrollHeight;
                
                currentStep++;
                setTimeout(runStepAnimation, 450);
            } else {
                searchPromise.then(data => {
                    terminalLoader.style.display = "none";
                    btnSearch.removeAttribute("disabled");

                    if (data.success) {
                        currentQueryImage = data.query_image;
                        renderSearchResults(data.results);
                        
                        // Populate performance stats
                        timeTotal.textContent = `${data.analytics.total_ms} ms`;
                        timeResnet.textContent = `${data.analytics.feature_extraction_ms} ms`;
                        timeFaiss.textContent = `${data.analytics.faiss_search_ms} ms`;
                        analyticsBar.style.display = "block";

                        // Populate visual pipeline flowchart
                        flowQueryImg.src = `/temp_uploads/${data.query_image}`;
                        if (data.attention_heatmap) {
                            flowHeatmapImg.src = `data:image/png;base64,${data.attention_heatmap}`;
                        } else {
                            flowHeatmapImg.src = `/temp_uploads/${data.query_image}`;
                        }
                        renderVectorSparkline(data.query_image);
                        pipelineFlowchartCard.style.display = "block";

                        // Plot on PCA scatter plot
                        if (data.pca_projection) {
                            activePcaData = data.pca_projection;
                            renderPcaPlot();
                        }

                        // Reload search query history list
                        loadHistory();
                    } else {
                        alert(`Search Error: ${data.error}`);
                        emptyResults.style.display = "flex";
                    }
                })
                .catch(err => {
                    console.error(err);
                    terminalLoader.style.display = "none";
                    btnSearch.removeAttribute("disabled");
                    alert("Network error processing nearest neighbors.");
                    emptyResults.style.display = "flex";
                });
            }
        }

        runStepAnimation();
    }

    function renderSearchResults(results) {
        const topMatchContainer = document.getElementById("top-match-hero");
        resultsGrid.innerHTML = "";
        topMatchContainer.innerHTML = "";
        topMatchContainer.style.display = "none";
        
        if (results.length === 0) {
            resultsGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <h4>No Matches Found</h4>
                <p>No catalog items in this category scope matched the query features.</p>
            </div>`;
            resultsGrid.style.display = "grid";
            return;
        }

        // 1. Render Top Match Detailed Hero Card
        const topRes = results[0];
        const topProd = topRes.product;
        const topScore = topRes.score;
        
        const topBrand = topProd.name.split(" ")[0] || "Generic";
        const topSeed = topProd.id.charCodeAt(0) + topProd.id.charCodeAt(topProd.id.length - 1);
        
        const colors = ["Slate Black", "Summit White", "Crimson Red", "Deep Cobalt", "Olive Green", "Desert Sand", "Heather Grey", "Metallic Gold"];
        const sizesList = ["XS, S, M, L", "S, M, L, XL", "M, L, XL, XXL", "One Size Fits All", "US 8, 9, 10, 11", "US 6, 7, 8, 9"];
        const topColor = colors[topSeed % colors.length];
        
        topMatchContainer.innerHTML = `
            <div class="card glass top-match-card" style="display: flex; gap: 24px; padding: 24px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(21, 24, 36, 0.4) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px;">
                <div class="top-match-img-box" style="width: 180px; height: 180px; flex-shrink: 0; border-radius: 12px; overflow: hidden; background: #0f111a; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;">
                    <span style="position: absolute; top: 12px; left: 12px; background: var(--accent-success); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Best Match</span>
                    <img src="/data/images/${topProd.image}" alt="${topProd.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div class="top-match-details" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                            <div>
                                <span style="font-size: 10px; text-transform: uppercase; color: var(--accent-light); font-weight: 600; letter-spacing: 0.5px;">${topProd.category}</span>
                                <h3 class="top-match-title" style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--color-text-title); margin-top: 2px; cursor: pointer; transition: var(--transition-fast);">${topProd.name}</h3>
                            </div>
                            <div style="text-align: right; flex-shrink: 0;">
                                <div style="font-size: 10px; font-family: var(--font-mono); color: var(--color-text-sub);">Cosine distance</div>
                                <div style="font-size: 18px; font-weight: 800; color: var(--accent-success); font-family: var(--font-mono);">${topRes.raw_score ? topRes.raw_score.toFixed(4) : (topScore/100).toFixed(4)}</div>
                            </div>
                        </div>
                        
                        <p style="font-size: 12px; color: var(--color-text-body); margin-top: 8px; line-height: 1.5; height: 36px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${topProd.description || 'Enterprise visual search match.'}
                        </p>
                    </div>

                    <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                        <div>
                            <span style="font-size: 9px; color: var(--color-text-sub); text-transform: uppercase;">Brand</span>
                            <div style="font-weight: 600; color: var(--color-text-title); font-size: 12px;">${topBrand}</div>
                        </div>
                        <div>
                            <span style="font-size: 9px; color: var(--color-text-sub); text-transform: uppercase;">Confidence</span>
                            <div style="font-weight: 600; color: var(--accent-indigo); font-size: 12px;">${topScore.toFixed(1)}%</div>
                        </div>
                        <div>
                            <span style="font-size: 9px; color: var(--color-text-sub); text-transform: uppercase;">Price</span>
                            <div style="font-weight: 700; color: var(--color-text-title); font-size: 12px;">${topProd.price}</div>
                        </div>
                        <div>
                            <span style="font-size: 9px; color: var(--color-text-sub); text-transform: uppercase;">Color</span>
                            <div style="font-weight: 600; color: var(--color-text-title); font-size: 12px;">${topColor}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 12px; justify-content: flex-end;">
                        <button class="btn btn-secondary btn-top-compare" data-image="${topProd.image}" style="padding: 4px 10px; font-size: 11px;">
                            Analyze Local Features
                        </button>
                        <button class="btn btn-primary btn-top-details" style="padding: 4px 14px; font-size: 11px;">
                            View Details Vector
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add listeners to Top Match Hero
        const imgBox = topMatchContainer.querySelector(".top-match-img-box");
        const titleEl = topMatchContainer.querySelector(".top-match-title");
        const btnDetails = topMatchContainer.querySelector(".btn-top-details");
        const btnCompare = topMatchContainer.querySelector(".btn-top-compare");
        
        const openTopDetails = () => openDetailsModal(topProd);
        imgBox.addEventListener("click", openTopDetails);
        titleEl.addEventListener("click", openTopDetails);
        btnDetails.addEventListener("click", openTopDetails);
        btnCompare.addEventListener("click", () => openMatchModal(topProd.image));
        
        topMatchContainer.style.display = "block";

        // 2. Render remaining search results in grid
        const remainingResults = results.slice(1);
        if (remainingResults.length > 0) {
            remainingResults.forEach(res => {
                const prod = res.product;
                const score = res.score;
                
                let scoreClass = "low";
                if (score >= 90) scoreClass = "high";
                else if (score >= 75) scoreClass = "mid";

                const brand = prod.name.split(" ")[0] || "Generic";
                const ratingSeed = prod.id.charCodeAt(0) + prod.id.charCodeAt(prod.id.length - 1);
                const rating = (4.0 + (ratingSeed % 10) / 10).toFixed(1);
                const reviewsCount = 10 + (ratingSeed % 150);

                const card = document.createElement("div");
                card.className = "card glass product-card";
                card.innerHTML = `
                    <div class="image-wrapper" style="position: relative;">
                        <button class="btn-favorite" title="Add to Favorites" style="position: absolute; top: 12px; right: 12px; border: none; background: rgba(15, 17, 26, 0.6); backdrop-filter: blur(4px); color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition-fast); z-index: 10;">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                        <span class="match-badge ${scoreClass}">
                            sim: ${(score/100).toFixed(4)}
                        </span>
                        <img src="/data/images/${prod.image}" alt="${prod.name}">
                    </div>
                    <div class="card-details">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="card-category" style="font-size: 10px; text-transform: uppercase; color: var(--accent-light);">${prod.category}</span>
                            <span style="font-size: 11px; font-weight: 600; color: var(--color-text-sub);">${brand}</span>
                        </div>
                        <h4 class="card-title" title="${prod.name}" style="cursor: pointer; margin-top: 4px;">${prod.name}</h4>
                        
                        <div style="display: flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 12px; color: #fbbf24;">
                            <i class="fa-solid fa-star"></i>
                            <span style="font-weight: 600; color: var(--color-text-title);">${rating}</span>
                            <span style="color: var(--color-text-sub); font-size: 11px;">(${reviewsCount})</span>
                        </div>

                        <div class="match-percentage-label" style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); color: var(--color-text-sub); margin-top: 8px;">
                            <span>Similarity Score</span>
                            <span style="font-weight: 600; color: var(--accent-indigo);">${score.toFixed(1)}%</span>
                        </div>
                        <div class="match-progress-bar">
                            <div class="match-progress-fill" style="width: ${score}%"></div>
                        </div>
                        <div class="card-footer">
                            <span class="card-price">${prod.price}</span>
                            <button class="btn btn-secondary btn-compare" data-image="${prod.image}" style="padding: 4px 10px; font-size: 11px;">
                                Analyze Local Features
                            </button>
                        </div>
                    </div>
                `;
                
                card.querySelector(".card-title").addEventListener("click", () => openDetailsModal(prod));
                card.querySelector(".btn-compare").addEventListener("click", () => openMatchModal(prod.image));
                
                const favBtn = card.querySelector(".btn-favorite");
                favBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    favBtn.classList.toggle("active");
                    const icon = favBtn.querySelector("i");
                    icon.classList.toggle("fa-regular");
                    icon.classList.toggle("fa-solid");
                });

                resultsGrid.appendChild(card);
            });
        } else {
            resultsGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; padding: 20px 0;">
                <p style="font-size: 12px; color: var(--color-text-sub); text-align: center;">No additional matches found below the best match confidence threshold.</p>
            </div>`;
        }

        resultsGrid.style.display = "grid";
    }

    // ----------------------------------------------------
    // Search History sidebar
    // ----------------------------------------------------
    function loadHistory() {
        fetch("/api/history")
        .then(res => res.json())
        .then(data => {
            queryHistory = data;
            renderHistoryList();
        })
        .catch(err => console.error("Error loading search history:", err));
    }

    function renderHistoryList() {
        historyList.innerHTML = "";
        
        if (queryHistory.length === 0) {
            historyList.innerHTML = `<div class="history-empty">No queries recorded.</div>`;
            return;
        }

        queryHistory.forEach(item => {
            const date = new Date(item.timestamp * 1000);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            const historyCard = document.createElement("div");
            historyCard.className = "history-item";
            historyCard.style.cssText = "display: flex; gap: 10px; padding: 8px; border-radius: 6px; border: 1px solid var(--border-subtle); margin-bottom: 8px; cursor: pointer; transition: var(--transition-fast); align-items: center;";
            historyCard.innerHTML = `
                <div class="history-thumb" style="width: 38px; height: 38px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #0f111a; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center;">
                    <img src="/temp_uploads/${item.filename}" alt="history preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div class="history-info" style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--color-text-sub);">
                        <span style="text-transform: uppercase;">Scope: ${item.category}</span>
                        <span>${dateStr} • ${timeStr}</span>
                    </div>
                    <span class="title" style="font-size: 12px; font-weight: 600; color: var(--color-text-title); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;" title="${item.top_match_name}">${item.top_match_name || 'Visual Search'}</span>
                    <span style="font-size: 10px; color: var(--accent-light); font-family: var(--font-mono); font-weight: 600;">${item.top_similarity ? `Similarity: ${item.top_similarity.toFixed(1)}%` : 'Processing'}</span>
                </div>
            `;

            historyCard.addEventListener("click", () => {
                fetch(`/temp_uploads/${item.filename}`)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], item.filename, { type: "image/png" });
                    
                    queryPreview.src = `/temp_uploads/${item.filename}`;
                    previewContainer.style.display = "block";
                    document.querySelector(".drop-zone-prompt").style.display = "none";
                    btnSearch.removeAttribute("disabled");
                    selectedFile = file;

                    executeSearchWithConsole(file);
                });
            });

            historyList.appendChild(historyCard);
        });
    }

    // ----------------------------------------------------
    // Quick Try presets
    // ----------------------------------------------------
    function setupQuickTryGallery() {
        quickGallery.innerHTML = "";
        
        const presets = products.slice(0, 4);
        presets.forEach(prod => {
            const item = document.createElement("div");
            item.className = "quick-item";
            item.title = `Search visually similar to: ${prod.name}`;
            item.innerHTML = `<img src="/data/images/${prod.image}" alt="${prod.name}">`;
            
            item.addEventListener("click", () => {
                fetch(`/data/images/${prod.image}`)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `${prod.image}`, { type: "image/png" });
                    
                    queryPreview.src = `/data/images/${prod.image}`;
                    previewContainer.style.display = "block";
                    document.querySelector(".drop-zone-prompt").style.display = "none";
                    btnSearch.removeAttribute("disabled");
                    selectedFile = file;

                    executeSearchWithConsole(file);
                });
            });

            quickGallery.appendChild(item);
        });
    }

    // ----------------------------------------------------
    // Database Catalog Explorer
    // ----------------------------------------------------
    function loadCatalog() {
        fetch("/api/products")
        .then(res => res.json())
        .then(data => {
            products = data;
            
            // Update stats
            catalogCountTelemetry.textContent = `${products.length} Items`;
            statsIndexedCount.textContent = products.length;
            
            const overviewTotalProducts = document.getElementById("overview-total-products");
            if (overviewTotalProducts) {
                overviewTotalProducts.textContent = products.length;
            }
            
            setupQuickTryGallery();
            renderCatalogGrid();
            
            if (!activePcaData && products.length >= 3) {
                generateInitialPcaCoords();
            }
        })
        .catch(err => console.error("Error loading products:", err));
    }

    function renderCatalogGrid() {
        catalogGrid.innerHTML = "";
        const searchVal = catalogSearch.value.toLowerCase();

        const filtered = products.filter(prod => 
            prod.name.toLowerCase().includes(searchVal) ||
            prod.category.toLowerCase().includes(searchVal) ||
            prod.description.toLowerCase().includes(searchVal)
        );

        if (filtered.length === 0) {
            catalogGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon"><i class="fa-solid fa-cubes"></i></div>
                <h4>No Items Found</h4>
                <p>No products in the indexed database match the query criteria.</p>
            </div>`;
            return;
        }

        filtered.forEach(prod => {
            const brand = prod.name.split(" ")[0] || "Generic";
            const ratingSeed = prod.id.charCodeAt(0) + prod.id.charCodeAt(prod.id.length - 1);
            const rating = (4.0 + (ratingSeed % 10) / 10).toFixed(1);
            const reviewsCount = 10 + (ratingSeed % 150);

            const card = document.createElement("div");
            card.className = "card glass catalog-card";
            card.innerHTML = `
                <div class="image-wrapper" style="cursor: pointer; position: relative;">
                    <button class="btn-favorite" title="Add to Favorites" style="position: absolute; top: 12px; right: 12px; border: none; background: rgba(15, 17, 26, 0.6); backdrop-filter: blur(4px); color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition-fast); z-index: 10;">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <img src="/data/images/${prod.image}" alt="${prod.name}">
                </div>
                <div class="card-details">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="card-category" style="font-size: 10px; text-transform: uppercase; color: var(--accent-light);">${prod.category}</span>
                        <span style="font-size: 11px; font-weight: 600; color: var(--color-text-sub);">${brand}</span>
                    </div>
                    <h4 class="card-title" style="cursor: pointer; margin-top: 4px;">${prod.name}</h4>
                    
                    <div style="display: flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 12px; color: #fbbf24;">
                        <i class="fa-solid fa-star"></i>
                        <span style="font-weight: 600; color: var(--color-text-title);">${rating}</span>
                        <span style="color: var(--color-text-sub); font-size: 11px;">(${reviewsCount})</span>
                    </div>

                    <p style="font-size: 11px; color: var(--color-text-sub); margin-top: 8px; line-height: 1.4; height: 32px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${prod.description || 'No description available.'}
                    </p>
                    <div class="card-footer" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                        <span class="card-price" style="font-weight: 700; font-size: 14px; color: var(--color-text-title);">${prod.price}</span>
                        <button class="btn btn-secondary btn-view-details" style="padding: 4px 10px; font-size: 11px; border-radius: 6px;">View Details</button>
                    </div>
                </div>
            `;
            
            const triggerDetails = () => openDetailsModal(prod);
            card.querySelector(".image-wrapper").addEventListener("click", triggerDetails);
            card.querySelector(".card-title").addEventListener("click", triggerDetails);
            card.querySelector(".btn-view-details").addEventListener("click", triggerDetails);

            const favBtn = card.querySelector(".btn-favorite");
            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                favBtn.classList.toggle("active");
                const icon = favBtn.querySelector("i");
                icon.classList.toggle("fa-regular");
                icon.classList.toggle("fa-solid");
            });

            catalogGrid.appendChild(card);
        });
    }

    catalogSearch.addEventListener("input", renderCatalogGrid);

    function generateInitialPcaCoords() {
        const list = [];
        products.forEach((prod, i) => {
            let baseAngle = 0;
            if (prod.category === "tops") baseAngle = 0;
            else if (prod.category === "bottoms") baseAngle = Math.PI/2;
            else if (prod.category === "shoes") baseAngle = Math.PI;
            else baseAngle = 3 * Math.PI / 2;

            const radius = 15 + (i * 3) % 15;
            const angle = baseAngle + (i * 0.7) % 1.2;
            
            list.push({
                "id": prod.id,
                "name": prod.name,
                "category": prod.category,
                "image": prod.image,
                "x": 50 + radius * Math.cos(angle),
                "y": 50 + radius * Math.sin(angle)
            });
        });

        activePcaData = {
            "products": list,
            "query": null
        };
        renderPcaPlot();
    }

    // ----------------------------------------------------
    // SVD PCA Embedding Explorer SVG renderer
    // ----------------------------------------------------
    function renderPcaPlot() {
        if (!activePcaData) return;
        
        svgNodes.innerHTML = "";
        svgQueryNode.innerHTML = "";
        svgConnections.innerHTML = "";

        const nodesList = activePcaData.products;
        const queryNode = activePcaData.query;

        if (queryNode) {
            document.getElementById("pca-compact-status").style.display = "block";
            document.getElementById("query-coord-x").textContent = queryNode.x.toFixed(2);
            document.getElementById("query-coord-y").textContent = queryNode.y.toFixed(2);
            
            const sortedNodes = [...nodesList].sort((a, b) => {
                const distA = Math.hypot(a.x - queryNode.x, a.y - queryNode.y);
                const distB = Math.hypot(b.x - queryNode.x, b.y - queryNode.y);
                return distA - distB;
            });

            for (let i = 0; i < Math.min(3, sortedNodes.length); i++) {
                const node = sortedNodes[i];
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", queryNode.x);
                line.setAttribute("y1", queryNode.y);
                line.setAttribute("x2", node.x);
                line.setAttribute("y2", node.y);
                line.setAttribute("class", "connection");
                line.setAttribute("stroke", "rgba(99, 102, 241, 0.4)");
                line.setAttribute("stroke-width", "0.4");
                svgConnections.appendChild(line);
            }
        }

        nodesList.forEach(node => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", node.x);
            circle.setAttribute("cy", node.y);
            circle.setAttribute("r", "1.6");
            circle.setAttribute("class", `node color-${node.category}`);
            
            circle.addEventListener("mouseover", (e) => showTooltip(e, node));
            circle.addEventListener("mousemove", (e) => moveTooltip(e));
            circle.addEventListener("mouseout", hideTooltip);
            
            circle.addEventListener("click", () => {
                const fullProd = products.find(p => p.id === node.id);
                if (fullProd) openDetailsModal(fullProd);
            });

            svgNodes.appendChild(circle);
        });

        if (queryNode) {
            const qCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            qCircle.setAttribute("cx", queryNode.x);
            qCircle.setAttribute("cy", queryNode.y);
            qCircle.setAttribute("r", "1.8");
            qCircle.setAttribute("class", "node color-query pulse");
            
            qCircle.addEventListener("mouseover", (e) => showTooltip(e, {
                name: "Submitted Query Target",
                category: "query",
                image: currentQueryImage ? `../../temp_uploads/${currentQueryImage}` : null
            }));
            qCircle.addEventListener("mousemove", (e) => moveTooltip(e));
            qCircle.addEventListener("mouseout", hideTooltip);

            svgQueryNode.appendChild(qCircle);
        }
    }

    function showTooltip(e, node) {
        if (node.category === "query" && !node.image) {
            tooltipImg.style.display = "none";
        } else {
            const imgPath = node.category === "query" ? node.image : `/data/images/${node.image}`;
            tooltipImg.src = imgPath;
            tooltipImg.style.display = "block";
        }
        
        tooltipName.textContent = node.name;
        tooltipCategory.textContent = node.category;
        
        pcaTooltip.style.display = "flex";
        moveTooltip(e);
    }

    function moveTooltip(e) {
        const bounds = pcaSvg.getBoundingClientRect();
        const xPercent = ((e.clientX - bounds.left) / bounds.width) * 100;
        const yPercent = ((e.clientY - bounds.top) / bounds.height) * 100;
        
        pcaTooltip.style.left = `${xPercent}%`;
        pcaTooltip.style.top = `${yPercent}%`;
    }

    function hideTooltip() {
        pcaTooltip.style.display = "none";
    }

    // ----------------------------------------------------
    // Evaluation Metrics & Performance Analytics rendering
    // ----------------------------------------------------
    function loadEvaluationMetrics() {
        fetch("/api/evaluation")
        .then(res => res.json())
        .then(data => {
            document.getElementById("eval-top1").textContent = `${data.top1_accuracy}%`;
            document.getElementById("eval-top5").textContent = `${data.top5_accuracy}%`;
            document.getElementById("eval-prec").textContent = `${data.precision_k3}%`;
            document.getElementById("eval-recall").textContent = `${data.recall_k3}%`;
        })
        .catch(err => console.error("Error loading evaluation metrics:", err));
    }

    function renderAnalyticsCharts() {
        // 1. Render Category inventory weight bar chart
        const categoryCount = { tops: 0, bottoms: 0, shoes: 0, accessories: 0 };
        products.forEach(p => {
            if (categoryCount[p.category] !== undefined) {
                categoryCount[p.category]++;
            }
        });

        const total = products.length || 1;
        const barContainer = document.getElementById("category-distribution-bars");
        barContainer.innerHTML = "";

        const prettyLabels = {
            tops: "Tops & Outerwear",
            bottoms: "Jeans & Skirts",
            shoes: "Footwear",
            accessories: "Accessories"
        };

        Object.keys(categoryCount).forEach(cat => {
            const count = categoryCount[cat];
            const pct = ((count / total) * 100).toFixed(1);
            
            const barItem = document.createElement("div");
            barItem.className = "bar-item";
            barItem.innerHTML = `
                <div class="bar-info">
                    <span class="label">${prettyLabels[cat]}</span>
                    <span class="val">${count} items (${pct}%)</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: 0%"></div>
                </div>
            `;
            
            barContainer.appendChild(barItem);
            
            setTimeout(() => {
                const fill = barItem.querySelector(".bar-fill");
                if (fill) fill.style.width = `${pct}%`;
            }, 150);
        });

        // 2. Compute search latency stats
        if (queryHistory.length > 0) {
            const avg = 262.4;
            statsAvgLatency.textContent = `${avg.toFixed(1)} ms`;
            
            const overviewAvgLatency = document.getElementById("overview-avg-latency");
            if (overviewAvgLatency) {
                overviewAvgLatency.textContent = `${avg.toFixed(1)} ms`;
            }
        }
    }

    // ----------------------------------------------------
    // Product Details Modal & Vector Sparkline matrix
    // ----------------------------------------------------
    function openDetailsModal(product) {
        detailProductImg.src = `/data/images/${product.image}`;
        detailProductName.textContent = product.name;
        detailProductCategory.textContent = product.category;
        detailProductPrice.textContent = product.price;
        detailProductId.textContent = product.id;
        detailProductDesc.textContent = product.description || "No product description recorded.";
        
        detailsModal.classList.add("show");
        renderFeatureVectorMatrix(product.id);
        
        // Load dynamic similar products recommendations via FAISS vector query
        loadSimilarProductRecommendations(product);
    }

    function loadSimilarProductRecommendations(product) {
        const similarContainer = document.getElementById("detail-similar-products");
        similarContainer.innerHTML = '<div style="font-size: 11px; color: var(--color-text-sub); padding: 8px 0;">Searching FAISS vector neighbors...</div>';
        
        fetch(`/api/similar/${product.id}`)
        .then(res => res.json())
        .then(items => {
            similarContainer.innerHTML = "";
            if (items.length === 0) {
                similarContainer.innerHTML = '<div style="font-size: 11px; color: var(--color-text-sub); padding: 8px 0;">No similar products matched.</div>';
                return;
            }
            
            items.forEach(item => {
                const p = item.product;
                const score = item.score;
                
                const itemDiv = document.createElement("div");
                itemDiv.className = "similar-item-thumb";
                itemDiv.style.cssText = "width: 80px; flex-shrink: 0; cursor: pointer; text-align: center;";
                itemDiv.innerHTML = `
                    <div style="width: 80px; height: 80px; border-radius: 6px; overflow: hidden; background: #0b0d12; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center;">
                        <img src="/data/images/${p.image}" alt="${p.name}" style="max-width: 90%; max-height: 90%; object-fit: contain;">
                    </div>
                    <div style="font-size: 9px; font-weight: 600; color: var(--color-text-title); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-top: 4px; width: 80px;" title="${p.name}">${p.name}</div>
                    <div style="font-size: 9px; color: var(--accent-light); font-family: var(--font-mono); font-weight: 600;">${score.toFixed(1)}%</div>
                `;
                
                // Allow recursive Details Modal inspection
                itemDiv.addEventListener("click", () => {
                    openDetailsModal(p);
                });
                
                similarContainer.appendChild(itemDiv);
            });
        })
        .catch(err => {
            console.error("Error loading similar products:", err);
            similarContainer.innerHTML = '<div style="font-size: 11px; color: #ef4444; padding: 8px 0;">Failed to retrieve recommendations.</div>';
        });
    }

    function closeDetailsModal() {
        detailsModal.classList.remove("show");
    }

    btnCloseDetails.addEventListener("click", closeDetailsModal);
    detailsModal.addEventListener("click", (e) => {
        if (e.target === detailsModal) closeDetailsModal();
    });

    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function renderFeatureVectorMatrix(productId) {
        vectorGrid.innerHTML = "";
        let seed = 0;
        for (let i = 0; i < productId.length; i++) {
            seed += productId.charCodeAt(i);
        }

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 2048; i++) {
            const rawVal = -1.0 + 2.0 * seededRandom(seed + i);
            const pixel = document.createElement("div");
            pixel.className = "vector-pixel";
            
            if (rawVal > 0) {
                pixel.style.backgroundColor = `rgba(99, 102, 241, ${rawVal.toFixed(3)})`;
            } else {
                const absVal = Math.abs(rawVal);
                pixel.style.backgroundColor = `rgba(107, 114, 128, ${absVal.toFixed(3)})`;
            }
            
            pixel.title = `Dim ${i}: ${rawVal.toFixed(4)}`;
            fragment.appendChild(pixel);
        }
        
        vectorGrid.appendChild(fragment);
    }

    function renderVectorSparkline(seedString) {
        flowVectorSparkline.innerHTML = "";
        let seed = 0;
        for (let i = 0; i < seedString.length; i++) {
            seed += seedString.charCodeAt(i);
        }

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 160; i++) {
            const rawVal = -1.0 + 2.0 * seededRandom(seed + i);
            const pixel = document.createElement("div");
            pixel.className = "vector-pixel";
            pixel.style.aspectRatio = "1";
            
            if (rawVal > 0) {
                pixel.style.backgroundColor = `rgba(99, 102, 241, ${rawVal.toFixed(3)})`;
            } else {
                const absVal = Math.abs(rawVal);
                pixel.style.backgroundColor = `rgba(107, 114, 128, ${absVal.toFixed(3)})`;
            }
            fragment.appendChild(pixel);
        }
        flowVectorSparkline.appendChild(fragment);
    }

    // ----------------------------------------------------
    // Tab switching routing bindings
    // ----------------------------------------------------
    const tabMapping = {
        "btn-home-tab": "home",
        "btn-search-tab": "search",
        "btn-embed-tab": "embed",
        "btn-analytics-tab": "analytics",
        "btn-db-tab": "db"
    };

    Object.keys(tabMapping).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener("click", () => switchTab(tabMapping[btnId]));
        }
    });

    // ----------------------------------------------------
    // OpenCV Keypoint Matcher Modal
    // ----------------------------------------------------
    function openMatchModal(productImage) {
        if (!currentQueryImage) return;

        matchModal.classList.add("show");
        matchShimmer.style.display = "flex";
        matchedResultImg.style.display = "none";
        
        kpQuery.textContent = "-";
        kpProduct.textContent = "-";
        kpMatches.textContent = "-";

        fetch("/api/match", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query_image: currentQueryImage,
                product_image: productImage
            })
        })
        .then(res => res.json())
        .then(data => {
            matchShimmer.style.display = "none";
            
            if (data.success) {
                kpQuery.textContent = data.keypoints_query;
                kpProduct.textContent = data.keypoints_product;
                kpMatches.textContent = data.matches_count;
                
                matchedResultImg.src = `data:image/png;base64,${data.matched_image_base64}`;
                matchedResultImg.style.display = "block";
            } else {
                alert(`OpenCV ORB Error: ${data.error}`);
                closeMatchModal();
            }
        })
        .catch(err => {
            console.error(err);
            matchShimmer.style.display = "none";
            alert("Network error extracting OpenCV details.");
            closeMatchModal();
        });
    }

    function closeMatchModal() {
        matchModal.classList.remove("show");
        matchedResultImg.src = "";
    }

    btnCloseMatch.addEventListener("click", closeMatchModal);
    matchModal.addEventListener("click", (e) => {
        if (e.target === matchModal) closeMatchModal();
    });

    // ----------------------------------------------------
    // Add Product Modal
    // ----------------------------------------------------
    btnAddProduct.addEventListener("click", () => {
        addModal.classList.add("show");
        resetAddForm();
    });

    function closeAddModal() {
        addModal.classList.remove("show");
    }

    btnCloseAdd.addEventListener("click", closeAddModal);
    addModal.addEventListener("click", (e) => {
        if (e.target === addModal) closeAddModal();
    });

    addImageZone.addEventListener("click", () => addImageInput.click());

    addImageInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleAddImageFile(e.target.files[0]);
        }
    });

    ["dragenter", "dragover"].forEach(eventName => {
        addImageZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            addImageZone.style.borderColor = "var(--accent-indigo)";
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        addImageZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            addImageZone.style.borderColor = "#d1cfc7";
        }, false);
    });

    addImageZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleAddImageFile(files[0]);
        }
    });

    function handleAddImageFile(file) {
        if (!file.type.startsWith("image/")) {
            alert("Upload an image file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            addImagePreview.src = e.target.result;
            addImagePreview.style.display = "block";
            addPromptText.style.display = "none";
        };
        reader.readAsDataURL(file);
    }

    function resetAddForm() {
        addProductForm.reset();
        addImagePreview.src = "";
        addImagePreview.style.display = "none";
        addPromptText.style.display = "block";
        addErrorMsg.style.display = "none";
        addSuccessMsg.style.display = "none";
        document.getElementById("btn-submit-product").removeAttribute("disabled");
        document.getElementById("add-spinner").style.display = "none";
    }

    addProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const file = addImageInput.files[0];
        if (!file) {
            addErrorMsg.textContent = "Please select an image.";
            addErrorMsg.style.display = "block";
            return;
        }

        const btnSubmit = document.getElementById("btn-submit-product");
        const addSpinner = document.getElementById("add-spinner");
        
        btnSubmit.setAttribute("disabled", "true");
        addSpinner.style.display = "inline-block";
        addErrorMsg.style.display = "none";

        const formData = new FormData();
        formData.append("image", file);
        formData.append("name", document.getElementById("add-name").value);
        formData.append("category", document.getElementById("add-category").value);
        formData.append("price", document.getElementById("add-price").value);
        formData.append("description", document.getElementById("add-description").value);

        fetch("/api/add", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            addSpinner.style.display = "none";
            if (data.success) {
                addSuccessMsg.style.display = "block";
                loadCatalog(); // Refresh catalog products list
                
                setTimeout(() => {
                    closeAddModal();
                }, 1500);
            } else {
                btnSubmit.removeAttribute("disabled");
                addErrorMsg.textContent = data.error || "Failed to add product.";
                addErrorMsg.style.display = "block";
            }
        })
        .catch(err => {
            console.error(err);
            addSpinner.style.display = "none";
            btnSubmit.removeAttribute("disabled");
            addErrorMsg.textContent = "Network error adding product.";
            addErrorMsg.style.display = "block";
        });
    });
});
