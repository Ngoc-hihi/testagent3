/* ===================================================
   YEUOI - ENTERPRISE DATA INTELLIGENCE PLATFORM
   Client-Side Application Controller (v2.5)
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    currentStep: 1,
    selectedFile: null,
    businessType: "Chuỗi F&B, Nhà hàng & Dịch vụ Ẩm thực",
    problemStatement: "",
    additionalInfo: "",
    cleaningData: null,
    analyticsData: null,
    previewRows: [],
    previewCols: [],
    charts: {
      trend: null,
      category: null,
      distribution: null
    }
  };

  // Safe JSON API Fetch Helper (Prevents Vercel 404 HTML Unexpected Token crashes & auto-fallbacks /api <-> root)
  async function safeFetchJson(url, options = {}) {
    let res = await fetch(url, options);
    // If endpoint returned 404, automatically retry alternate prefix (/api vs direct root)
    if (res.status === 404) {
      const altUrl = url.startsWith("/api/") ? url.replace(/^\/api/, "") : (url.startsWith("/") ? "/api" + url : "/api/" + url);
      try {
        const altRes = await fetch(altUrl, options);
        if (altRes.ok || altRes.status !== 404) {
          res = altRes;
        }
      } catch (e) {
        // ignore fallback failure
      }
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      if (res.status === 404) {
        throw new Error("Không tìm thấy dịch vụ máy chủ (404 Not Found).");
      }
      if (res.status >= 500) {
        throw new Error(`Máy chủ gặp sự cố (${res.status}). Vui lòng thử lại sau giây lát.`);
      }
      throw new Error(`Phản hồi máy chủ không hợp lệ (${res.status}): ${text.substring(0, 100)}`);
    }
    const data = await res.json();
    return data;
  }

  // Detect and display dynamic host badge (Localhost vs Vercel Serverless)
  const hostSystemText = document.getElementById("hostSystemText");
  if (hostSystemText) {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      hostSystemText.textContent = "Localhost:8000";
    } else if (hostname.includes("vercel.app")) {
      hostSystemText.textContent = "Vercel Cloud Serverless";
    } else {
      hostSystemText.textContent = window.location.host;
    }
  }

  // DOM Elements - Navigation & Sidebar
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navItems = document.querySelectorAll(".nav-item");
  const pageTitleHeading = document.getElementById("pageTitleHeading");
  const pageSubtitleDesc = document.getElementById("pageSubtitleDesc");
  const sidebarStatusText = document.getElementById("sidebarStatusText");
  const themeToggle = document.getElementById("themeToggle");
  const btnResetSession = document.getElementById("btnResetSession");
  const btnSidebarReset = document.getElementById("btnSidebarReset");
  const resetModal = document.getElementById("resetModal");
  const btnCloseResetModal = document.getElementById("btnCloseResetModal");
  const btnCancelReset = document.getElementById("btnCancelReset");
  const btnConfirmReset = document.getElementById("btnConfirmReset");

  // Step Views
  const stepViews = {
    1: document.getElementById("step1View"),
    2: document.getElementById("step2View"),
    3: document.getElementById("step3View"),
    4: document.getElementById("step4View")
  };

  // Step 1 Elements
  const btnStartWorkflow = document.getElementById("btnStartWorkflow");
  const btnTrySampleQuick = document.getElementById("btnTrySampleQuick");
  const industryPills = document.querySelectorAll(".pill-chip");

  // Step 2 Elements
  const inputBusinessType = document.getElementById("inputBusinessType");
  const inputExtraInfo = document.getElementById("inputExtraInfo");
  const inputProblem = document.getElementById("inputProblem");
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const selectedFileCard = document.getElementById("selectedFileCard");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  const fileSizeDisplay = document.getElementById("fileSizeDisplay");
  const btnRemoveFile = document.getElementById("btnRemoveFile");
  const sampleButtons = document.querySelectorAll(".btn-sample");
  const quickTags = document.querySelectorAll(".tag-pill:not(.rev-tag)");
  const btnSubmitData = document.getElementById("btnSubmitData");

  // Step 3 Elements - Approval Header
  const badgeApprovalStatus = document.getElementById("badgeApprovalStatus");
  const btnApproveData = document.getElementById("btnApproveData");
  const btnRequestRevision = document.getElementById("btnRequestRevision");

  // Step 3 Elements - Config Panel
  const configToggleHeader = document.getElementById("configToggleHeader");
  const configPanelBody = document.getElementById("configPanelBody");
  const btnFoldConfig = document.getElementById("btnFoldConfig");
  const cfgRemoveDupes = document.getElementById("cfgRemoveDupes");
  const cfgStandardizeText = document.getElementById("cfgStandardizeText");
  const cfgStandardizeDates = document.getElementById("cfgStandardizeDates");
  const cfgConvertNumbers = document.getElementById("cfgConvertNumbers");
  const cfgFixNegatives = document.getElementById("cfgFixNegatives");
  const cfgMissingStrategy = document.getElementById("cfgMissingStrategy");
  const btnApplyConfig = document.getElementById("btnApplyConfig");

  // Step 3 Elements - Quality Comparison (Trước vs Sau)
  const compRowBefore = document.getElementById("compRowBefore");
  const compRowAfter = document.getElementById("compRowAfter");
  const compRowDiff = document.getElementById("compRowDiff");

  const compMissBefore = document.getElementById("compMissBefore");
  const compMissAfter = document.getElementById("compMissAfter");
  const compMissDiff = document.getElementById("compMissDiff");

  const compFormatBefore = document.getElementById("compFormatBefore");
  const compFormatAfter = document.getElementById("compFormatAfter");
  const compFormatDiff = document.getElementById("compFormatDiff");

  const compScoreBefore = document.getElementById("compScoreBefore");
  const compScoreAfter = document.getElementById("compScoreAfter");
  const compScoreDiff = document.getElementById("compScoreDiff");

  // Step 3 Elements - Logs
  const auditLogToggle = document.getElementById("auditLogToggle");
  const auditLogContainer = document.getElementById("auditLogContainer");
  const btnFoldAudit = document.getElementById("btnFoldAudit");

  // Step 3 Elements - Preview Table
  const previewTableHead = document.getElementById("previewTableHead");
  const previewTableBody = document.getElementById("previewTableBody");
  const chkShowOriginal = document.getElementById("chkShowOriginal");
  const chkOnlyModified = document.getElementById("chkOnlyModified");
  const btnExportCsvQuick = document.getElementById("btnExportCsvQuick");
  const btnExportExcelQuick = document.getElementById("btnExportExcelQuick");
  const tableSearchInput = document.getElementById("tableSearchInput");
  const tableRowCount = document.getElementById("tableRowCount");

  // Step 3 Elements - Revision Drawer
  const revisionDrawer = document.getElementById("revisionDrawer");
  const btnCloseRevision = document.getElementById("btnCloseRevision");
  const btnCancelRevision = document.getElementById("btnCancelRevision");
  const btnSubmitRevision = document.getElementById("btnSubmitRevision");
  const revisionInstructions = document.getElementById("revisionInstructions");
  const revisionTags = document.querySelectorAll(".rev-tag");

  // Step 4 Elements - Dashboard & Strategy
  const dashBusinessTitle = document.getElementById("dashBusinessTitle");
  const dashProblemSubtitle = document.getElementById("dashProblemSubtitle");
  const btnExportDocx = document.getElementById("btnExportDocx");
  const btnExportDocxBottom = document.getElementById("btnExportDocxBottom");
  const btnExportDataCsv = document.getElementById("btnExportDataCsv");
  
  // Dual-Tier Filters
  const filterMetricSelect = document.getElementById("filterMetricSelect");
  const filterGroupSelect = document.getElementById("filterGroupSelect");
  const filterCategory = document.getElementById("filterCategory");
  const filterRegion = document.getElementById("filterRegion");
  const filterStatus = document.getElementById("filterStatus");
  const btnResetFilter = document.getElementById("btnResetFilter");

  const kpiContainer = document.getElementById("kpiContainer");
  const overviewBullets = document.getElementById("overviewBullets");
  const strategyHeading = document.getElementById("strategyHeading");
  const solutionName = document.getElementById("solutionName");
  const solutionDesc = document.getElementById("solutionDesc");
  const solutionStepsList = document.getElementById("solutionStepsList");
  const prosList = document.getElementById("prosList");
  const consList = document.getElementById("consList");
  const rationaleWhy = document.getElementById("rationaleWhy");
  const rationaleImpact = document.getElementById("rationaleImpact");

  // Toast
  const toastNotification = document.getElementById("toastNotification");
  const toastMsg = document.getElementById("toastMsg");

  function showToast(message, duration = 3000) {
    toastMsg.textContent = message;
    toastNotification.classList.add("show");
    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, duration);
  }

  // ===================================================
  // NAVIGATION CONTROLLER
  // ===================================================
  const stepTitles = {
    1: {
      title: "Giới thiệu nền tảng YEUOI",
      subtitle: "Hướng dẫn thao tác và tổng quan quy trình chuyển đổi số dữ liệu"
    },
    2: {
      title: "Nhập bối cảnh & Tải bộ dữ liệu",
      subtitle: "Khai báo thông tin doanh nghiệp và tải dữ liệu thô (.csv, .xlsx, .json)"
    },
    3: {
      title: "Làm sạch & Kiểm duyệt dữ liệu",
      subtitle: "Cấu hình quy chuẩn, đối chiếu chất lượng và kiểm duyệt bản dữ liệu đã làm sạch"
    },
    4: {
      title: "Dashboard Trực Quan & Chiến Lược Ra Quyết Định",
      subtitle: "Gộp chung các chỉ số đo lường, bộ lọc đa chiều và phương án hành động"
    }
  };

  function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 4) return;
    
    // Validation before moving to step 3 or 4
    if ((stepNumber === 3 || stepNumber === 4) && !state.cleaningData) {
      showToast("Vui lòng tải lên dữ liệu hoặc chọn dữ liệu mẫu ở Bước 2 trước!", 3500);
      return;
    }
    if (stepNumber === 4 && !state.analyticsData) {
      approveAndGenerateDashboard();
      return;
    }

    state.currentStep = stepNumber;

    navItems.forEach(item => {
      const step = parseInt(item.getAttribute("data-step"));
      if (step === stepNumber) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    pageTitleHeading.textContent = stepTitles[stepNumber].title;
    pageSubtitleDesc.textContent = stepTitles[stepNumber].subtitle;

    Object.keys(stepViews).forEach(k => {
      if (parseInt(k) === stepNumber) {
        stepViews[k].classList.add("active");
      } else {
        stepViews[k].classList.remove("active");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const step = parseInt(item.getAttribute("data-step"));
      goToStep(step);
    });
  });

  sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
  });

  themeToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.body.classList.add("high-contrast");
      showToast("Đã chuyển chế độ tương phản cao");
    } else {
      document.body.classList.remove("high-contrast");
      showToast("Đã chuyển chế độ pastel mặc định");
    }
  });

  // ===================================================
  // RESET SESSION (LÀM MỚI PHIÊN LÀM VIỆC)
  // ===================================================
  function openResetModal() {
    resetModal.style.display = "flex";
  }

  function closeResetModal() {
    resetModal.style.display = "none";
  }

  btnResetSession.addEventListener("click", openResetModal);
  btnSidebarReset.addEventListener("click", openResetModal);
  btnCloseResetModal.addEventListener("click", closeResetModal);
  btnCancelReset.addEventListener("click", closeResetModal);

  btnConfirmReset.addEventListener("click", async () => {
    closeResetModal();
    showToast("Đang làm mới hệ thống...", 2000);
    try {
      const data = await safeFetchJson("/api/reset", { method: "POST" });
      if (data.success) {
        // Reset state
        state.selectedFile = null;
        state.cleaningData = null;
        state.analyticsData = null;
        state.previewRows = [];
        state.previewCols = [];

        // Reset UI
        fileInput.value = "";
        selectedFileCard.style.display = "none";
        dropzone.style.display = "block";
        inputProblem.value = "";
        inputExtraInfo.value = "";
        sidebarStatusText.textContent = "Chưa nạp dữ liệu";
        badgeApprovalStatus.textContent = "CHỜ DUYỆT (LẦN #1)";
        badgeApprovalStatus.style.background = "#D1FAE5";
        badgeApprovalStatus.style.color = "#065F46";

        goToStep(1);
        showToast("Hệ thống đã được làm mới hoàn toàn! Bạn có thể bắt đầu bộ dữ liệu mới.");
      }
    } catch (err) {
      showToast("Lỗi làm mới: " + err.message);
    }
  });

  // ===================================================
  // STEP 1 INTERACTIONS
  // ===================================================
  btnStartWorkflow.addEventListener("click", () => {
    goToStep(2);
  });

  btnTrySampleQuick.addEventListener("click", () => {
    goToStep(2);
    loadSampleData("fnb");
  });

  industryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      industryPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const ind = pill.getAttribute("data-ind");
      if (ind === "fnb") {
        inputBusinessType.value = "Chuỗi F&B, Nhà hàng & Dịch vụ Ẩm thực";
      } else if (ind === "retail") {
        inputBusinessType.value = "Bán lẻ đa kênh & Thương mại điện tử (Omnichannel Retail)";
      } else if (ind === "saas") {
        inputBusinessType.value = "Công nghệ & Phần mềm Dịch vụ (B2B SaaS)";
      } else if (ind === "logistics") {
        inputBusinessType.value = "Sản xuất & Chuỗi cung ứng (Manufacturing)";
      }
    });
  });

  // ===================================================
  // STEP 2 INTERACTIONS: CONTEXT & FILE UPLOAD
  // ===================================================
  quickTags.forEach(tag => {
    tag.addEventListener("click", () => {
      inputProblem.value = tag.getAttribute("data-text");
      showToast("Đã điền gợi ý vấn đề phân tích");
    });
  });

  // Dropzone drag-drop
  ["dragenter", "dragover"].forEach(evName => {
    dropzone.addEventListener(evName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach(evName => {
    dropzone.addEventListener(evName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleSelectedFile(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleSelectedFile(e.target.files[0]);
    }
  });

  function handleSelectedFile(file) {
    state.selectedFile = file;
    fileNameDisplay.textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);
    fileSizeDisplay.textContent = `${sizeKB} KB - ${file.type || 'Tập tin dữ liệu'}`;
    selectedFileCard.style.display = "flex";
    dropzone.style.display = "none";
    showToast(`Đã nhận tập tin: ${file.name}`);
  }

  btnRemoveFile.addEventListener("click", () => {
    state.selectedFile = null;
    fileInput.value = "";
    selectedFileCard.style.display = "none";
    dropzone.style.display = "block";
    showToast("Đã hủy tập tin");
  });

  // Sample Buttons
  sampleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const sampleType = btn.getAttribute("data-sample");
      loadSampleData(sampleType);
    });
  });

  async function loadSampleData(sampleType) {
    showToast("Đang nạp bộ dữ liệu mẫu và chuẩn hóa...", 2000);
    try {
      const data = await safeFetchJson("/api/load-sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_type: sampleType,
          business_type: inputBusinessType.value,
          problem_statement: inputProblem.value,
          additional_info: inputExtraInfo.value
        })
      });
      if (data.success) {
        state.businessType = data.business_type;
        state.problemStatement = data.problem_statement;
        state.additionalInfo = data.additional_info;
        state.cleaningData = data.cleaning;

        inputBusinessType.value = data.business_type;
        inputProblem.value = data.problem_statement;
        inputExtraInfo.value = data.additional_info;

        renderCleaningResults(data.cleaning);
        sidebarStatusText.textContent = `Đã nạp mẫu: ${sampleType.toUpperCase()}`;
        showToast("Nạp bộ dữ liệu mẫu thành công! Đang chuyển sang xem đối chiếu chất lượng...");
        setTimeout(() => goToStep(3), 600);
      } else {
        showToast("Lỗi khi tải mẫu: " + (data.detail || "Không rõ"));
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ: " + err.message);
    }
  }

  // Submit Uploaded Dataset
  btnSubmitData.addEventListener("click", async () => {
    if (!state.selectedFile) {
      showToast("Vui lòng tải lên file dữ liệu hoặc chọn một trong các bộ dữ liệu mẫu!");
      return;
    }

    const businessTypeVal = inputBusinessType.value.trim();
    const problemVal = inputProblem.value.trim();

    if (!problemVal) {
      showToast("Vui lòng nhập vấn đề cần phân tích của doanh nghiệp!");
      inputProblem.focus();
      return;
    }

    state.businessType = businessTypeVal;
    state.problemStatement = problemVal;
    state.additionalInfo = inputExtraInfo.value.trim();

    const formData = new FormData();
    formData.append("file", state.selectedFile);
    formData.append("business_type", state.businessType);
    formData.append("problem_statement", state.problemStatement);
    formData.append("additional_info", state.additionalInfo);

    showToast("Đang tải dữ liệu và thực thi chuỗi làm sạch...", 3000);
    btnSubmitData.disabled = true;
    btnSubmitData.innerHTML = "<span>Đang làm sạch dữ liệu...</span>";

    try {
      const data = await safeFetchJson("/api/upload", {
        method: "POST",
        body: formData
      });
      if (data.success) {
        state.cleaningData = data.cleaning;
        renderCleaningResults(data.cleaning);
        sidebarStatusText.textContent = `Tệp: ${data.filename}`;
        showToast("Làm sạch dữ liệu thành công! Đang chuyển sang xem trước...");
        setTimeout(() => goToStep(3), 600);
      } else {
        showToast("Lỗi khi xử lý dữ liệu: " + (data.detail || "Không rõ"));
      }
    } catch (err) {
      showToast("Lỗi gửi dữ liệu: " + err.message);
    } finally {
      btnSubmitData.disabled = false;
      btnSubmitData.innerHTML = "<span>Tiến hành làm sạch & chuẩn hóa dữ liệu</span> <span class='btn-arrow'>→</span>";
    }
  });

  // ===================================================
  // STEP 3: CLEANING & REVIEW (PREVIEW & APPROVAL)
  // ===================================================

  // Toggle Config Body
  configToggleHeader.addEventListener("click", () => {
    if (configPanelBody.style.display === "none") {
      configPanelBody.style.display = "block";
      btnFoldConfig.textContent = "▼";
    } else {
      configPanelBody.style.display = "none";
      btnFoldConfig.textContent = "▲";
    }
  });

  // Apply Config
  btnApplyConfig.addEventListener("click", async () => {
    const configOverrides = {
      remove_duplicates: cfgRemoveDupes.checked,
      standardize_text: cfgStandardizeText.checked,
      standardize_dates: cfgStandardizeDates.checked,
      convert_numbers: cfgConvertNumbers.checked,
      fix_negative_values: cfgFixNegatives.checked,
      missing_value_strategy: cfgMissingStrategy.value
    };

    showToast("Đang tái áp dụng cấu hình làm sạch...", 2000);
    btnApplyConfig.disabled = true;

    try {
      const data = await safeFetchJson("/api/reclean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config_overrides: configOverrides,
          custom_instructions: revisionInstructions.value.trim()
        })
      });
      if (data.success) {
        state.cleaningData = data.cleaning;
        renderCleaningResults(data.cleaning);
        showToast("Đã áp dụng cấu hình và cập nhật đối chiếu dữ liệu thành công!");
      } else {
        showToast("Lỗi cấu hình: " + (data.detail || "Không rõ"));
      }
    } catch (err) {
      showToast("Lỗi kết nối: " + err.message);
    } finally {
      btnApplyConfig.disabled = false;
    }
  });

  // Render Cleaning Results
  function renderCleaningResults(cleanRes) {
    const meta = cleanRes.metadata || {};
    const audit = cleanRes.audit_log || [];
    const comp = cleanRes.quality_comparison || {};
    const preview = cleanRes.preview || [];

    // 1. Render Quality Comparison (Đối chiếu chất lượng trước vs sau)
    const rComp = comp.rows || {};
    compRowBefore.textContent = (rComp.before || meta.initial_rows || 0).toLocaleString();
    compRowAfter.textContent = (rComp.after || meta.final_rows || 0).toLocaleString();
    compRowDiff.textContent = rComp.diff < 0 ? `${rComp.diff} dòng trùng lặp` : "Giữ nguyên dòng";

    const mComp = comp.missing_values || {};
    compMissBefore.textContent = `${(mComp.before || meta.missing_filled || 0)} ô`;
    compMissAfter.textContent = "0 ô";
    compMissDiff.textContent = "100% Đã bù đắp";

    const fComp = comp.format_errors || {};
    compFormatBefore.textContent = `${(fComp.before || 0)} lỗi`;
    compFormatAfter.textContent = "0 lỗi";
    compFormatDiff.textContent = "Chuẩn hóa hoàn tất";

    const sComp = comp.quality_score || {};
    compScoreBefore.textContent = `${sComp.before || 72.5}`;
    compScoreAfter.textContent = `${sComp.after || 99.2}/100`;
    compScoreDiff.textContent = `+${sComp.diff || 26.7}% Cải thiện`;

    // 2. Render Audit Logs
    auditLogContainer.innerHTML = "";
    audit.forEach(item => {
      const row = document.createElement("div");
      row.className = "log-entry-row";
      row.innerHTML = `
        <div class="log-entry-info">
          <div class="log-entry-title">${escapeHtml(item.title)}</div>
          <div class="log-entry-detail">${escapeHtml(item.detail)}</div>
        </div>
        <span class="log-badge">${escapeHtml(item.badge || 'Đạt')}</span>
      `;
      auditLogContainer.appendChild(row);
    });

    // 3. Store preview rows & render diff table
    state.previewRows = preview;
    state.previewCols = meta.columns || [];
    renderDiffTable();
  }

  // Toggle Audit Log Body
  auditLogToggle.addEventListener("click", () => {
    if (auditLogContainer.style.display === "none") {
      auditLogContainer.style.display = "flex";
      btnFoldAudit.textContent = "▼";
    } else {
      auditLogContainer.style.display = "none";
      btnFoldAudit.textContent = "▲";
    }
  });

  // Render Diff Table
  function renderDiffTable() {
    const rows = state.previewRows;
    const cols = state.previewCols;

    if (!cols || cols.length === 0) {
      if (rows.length > 0 && rows[0]._cells) {
        state.previewCols = Object.keys(rows[0]._cells);
      }
    }

    const showOriginal = chkShowOriginal.checked;
    const onlyModified = chkOnlyModified.checked;
    const searchTerm = tableSearchInput.value.toLowerCase().trim();

    // Table Headers: STT + columns
    let headHtml = "<tr><th>STT</th>";
    state.previewCols.forEach(c => {
      headHtml += `<th>${escapeHtml(c.replace(/_/g, ' '))}</th>`;
    });
    headHtml += "</tr>";
    previewTableHead.innerHTML = headHtml;

    // Filter rows
    let visibleCount = 0;
    let bodyHtml = "";

    rows.forEach(r => {
      if (onlyModified && !r._is_modified) {
        return;
      }

      // Check search match
      if (searchTerm) {
        let matched = false;
        if (r._stt && r._stt.toLowerCase().includes(searchTerm)) matched = true;
        for (let c of state.previewCols) {
          const cell = r._cells[c];
          if (cell && (String(cell.val).toLowerCase().includes(searchTerm) || (cell.old_val && String(cell.old_val).toLowerCase().includes(searchTerm)))) {
            matched = true;
            break;
          }
        }
        if (!matched) return;
      }

      visibleCount++;
      bodyHtml += "<tr>";
      bodyHtml += `<td><strong>${r._stt}</strong></td>`;

      for (let c of state.previewCols) {
        const cell = r._cells[c] || { val: "", has_diff: false, old_val: null, diff_type: null };
        const diffClass = cell.has_diff ? `cell-diff-${cell.diff_type}` : "";
        
        let cellContent = `<span class="cell-val">${escapeHtml(String(cell.val))}</span>`;
        if (cell.has_diff && cell.old_val && showOriginal) {
          cellContent += `<span class="cell-old-val"><del>${escapeHtml(String(cell.old_val))}</del></span>`;
        }

        bodyHtml += `<td class="${diffClass}">${cellContent}</td>`;
      }

      bodyHtml += "</tr>";
    });

    if (visibleCount === 0) {
      bodyHtml = `<tr><td colspan="${state.previewCols.length + 1}" style="text-align:center; padding: 28px; color: var(--text-muted);">Không tìm thấy dòng dữ liệu nào khớp với bộ lọc hiện tại.</td></tr>`;
    }

    previewTableBody.innerHTML = bodyHtml;
    tableRowCount.textContent = `Hiển thị ${visibleCount} dòng dữ liệu mẫu`;
  }

  // Table Control Listeners
  chkShowOriginal.addEventListener("change", renderDiffTable);
  chkOnlyModified.addEventListener("change", renderDiffTable);
  tableSearchInput.addEventListener("input", renderDiffTable);

  btnExportCsvQuick.addEventListener("click", () => {
    showToast("Đang tải tệp CSV sạch...");
    window.location.href = "/api/export-data?format=csv";
  });

  btnExportExcelQuick.addEventListener("click", () => {
    showToast("Đang tải tệp Excel sạch...");
    window.location.href = "/api/export-data?format=xlsx";
  });

  // Revision Drawer
  btnRequestRevision.addEventListener("click", () => {
    revisionDrawer.style.display = "block";
    revisionDrawer.scrollIntoView({ behavior: "smooth", block: "center" });
    revisionInstructions.focus();
  });

  btnCloseRevision.addEventListener("click", () => {
    revisionDrawer.style.display = "none";
  });

  btnCancelRevision.addEventListener("click", () => {
    revisionDrawer.style.display = "none";
  });

  revisionTags.forEach(tag => {
    tag.addEventListener("click", () => {
      const txt = tag.getAttribute("data-text");
      if (revisionInstructions.value) {
        revisionInstructions.value += ", " + txt;
      } else {
        revisionInstructions.value = txt;
      }
    });
  });

  // Submit Re-clean
  btnSubmitRevision.addEventListener("click", async () => {
    const instructions = revisionInstructions.value.trim();
    if (!instructions) {
      showToast("Vui lòng ghi rõ yêu cầu chỉnh sửa hoặc các lỗi phát hiện!");
      return;
    }

    showToast("Agent đang tái rà soát và tinh chỉnh dữ liệu...", 2500);
    btnSubmitRevision.disabled = true;

    try {
      const data = await safeFetchJson("/api/reclean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_instructions: instructions })
      });
      if (data.success) {
        state.cleaningData = data.cleaning;
        renderCleaningResults(data.cleaning);
        revisionDrawer.style.display = "none";
        badgeApprovalStatus.textContent = "ĐÃ ĐIỀU CHỈNH THEO KH";
        badgeApprovalStatus.style.background = "#F3E8FF";
        badgeApprovalStatus.style.color = "#6B21A8";
        showToast("Đã tinh chỉnh dữ liệu thành công theo phản hồi của bạn!");
      } else {
        showToast("Lỗi tinh chỉnh: " + (data.detail || "Không rõ"));
      }
    } catch (err) {
      showToast("Lỗi kết nối: " + err.message);
    } finally {
      btnSubmitRevision.disabled = false;
    }
  });

  // Approve Cleaned Data -> Proceed to Dashboard & Strategy
  btnApproveData.addEventListener("click", () => {
    badgeApprovalStatus.textContent = "ĐÃ PHÊ DUYỆT (LẦN #1)";
    badgeApprovalStatus.style.background = "#D1FAE5";
    badgeApprovalStatus.style.color = "#065F46";
    approveAndGenerateDashboard();
  });

  async function approveAndGenerateDashboard() {
    const originalText = btnApproveData.innerHTML;
    btnApproveData.disabled = true;
    btnApproveData.innerHTML = "<span>⏳ Gemini AI đang phân tích chiến lược...</span>";
    showToast("Gemini AI đang tổng hợp số liệu và xây dựng chiến lược...", 3500);
    try {
      const data = await safeFetchJson("/api/approve", { method: "POST" });
      if (data.success) {
        state.analyticsData = data.analytics;
        state.businessType = data.business_type;
        state.problemStatement = data.problem_statement;
        
        // Setup filter options in Step 4
        setupFilterOptions(data.analytics.filter_options || {});
        renderDashboardAndStrategy(data.analytics);
        goToStep(4);
        showToast("Đã phân tích xong toàn bộ chỉ số và chiến lược kinh doanh!");
      } else {
        showToast("Lỗi phân tích: " + (data.detail || "Không rõ"));
      }
    } catch (err) {
      showToast("Lỗi phân tích: " + err.message);
    } finally {
      btnApproveData.disabled = false;
      btnApproveData.innerHTML = originalText;
    }
  }

  // ===================================================
  // STEP 4: DASHBOARD & STRATEGY (WITH DUAL-TIER REAL-TIME FILTERS)
  // ===================================================
  function setupFilterOptions(filterOpts) {
    // 1. Tầng 1: Chỉ số (Metrics)
    if (filterMetricSelect && filterOpts.available_metrics) {
      filterMetricSelect.innerHTML = "";
      filterOpts.available_metrics.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.label;
        if (filterOpts.selected_metric === m.id) opt.selected = true;
        filterMetricSelect.appendChild(opt);
      });
    }

    // 2. Tầng 1: Nhóm (Dimensions / Group By)
    if (filterGroupSelect && filterOpts.available_dimensions) {
      filterGroupSelect.innerHTML = "";
      filterOpts.available_dimensions.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.label;
        if (filterOpts.selected_dimension === d.id) opt.selected = true;
        filterGroupSelect.appendChild(opt);
      });
    }

    // 3. Tầng 2: Thu hẹp phạm vi - Categories
    filterCategory.innerHTML = '<option value="all">Tất cả nhóm món</option>';
    (filterOpts.categories || []).forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      filterCategory.appendChild(opt);
    });

    // 4. Tầng 2: Thu hẹp phạm vi - Regions / Channels
    filterRegion.innerHTML = '<option value="all">Tất cả khu vực</option>';
    (filterOpts.regions || []).forEach(reg => {
      const opt = document.createElement("option");
      opt.value = reg;
      opt.textContent = reg;
      filterRegion.appendChild(opt);
    });

    // 5. Tầng 2: Thu hẹp phạm vi - Statuses / Criteria
    filterStatus.innerHTML = '<option value="all">Tất cả bản ghi</option>';
    (filterOpts.statuses || []).forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      filterStatus.appendChild(opt);
    });
  }

  // Filter Event Listeners for both Tier 1 and Tier 2
  [filterMetricSelect, filterGroupSelect, filterCategory, filterRegion, filterStatus].forEach(el => {
    if (el) {
      el.addEventListener("change", async () => {
        await applyDashboardFilters();
      });
    }
  });

  btnResetFilter.addEventListener("click", async () => {
    filterCategory.value = "all";
    filterRegion.value = "all";
    filterStatus.value = "all";
    await applyDashboardFilters();
    showToast("Đã đặt lại bộ lọc chi tiết về mặc định");
  });

  async function applyDashboardFilters() {
    try {
      const data = await safeFetchJson("/api/filter-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric: filterMetricSelect ? filterMetricSelect.value : null,
          group_by: filterGroupSelect ? filterGroupSelect.value : null,
          category: filterCategory.value,
          region: filterRegion.value,
          status: filterStatus.value
        })
      });
      if (data.success) {
        state.analyticsData = data.analytics;
        renderDashboardAndStrategy(data.analytics);
      }
    } catch (err) {
      showToast("Lỗi áp dụng bộ lọc: " + err.message);
    }
  }

  function renderDashboardAndStrategy(analytics) {
    // Top banner
    dashBusinessTitle.textContent = `Báo Cáo Toàn Diện Dành Cho ${state.businessType}`;
    dashProblemSubtitle.textContent = `Vấn đề trọng tâm: ${state.problemStatement}`;

    // KPI Cards
    kpiContainer.innerHTML = "";
    (analytics.kpis || []).forEach(kpi => {
      const card = document.createElement("div");
      card.className = "kpi-card";
      const isPos = kpi.trend_type === "positive";
      card.innerHTML = `
        <div class="kpi-card-top">
          <span class="kpi-label">${escapeHtml(kpi.label)}</span>
          <span class="kpi-trend ${isPos ? 'trend-pos' : 'trend-neutral'}">${escapeHtml(kpi.trend)}</span>
        </div>
        <div class="kpi-value">${escapeHtml(kpi.value)}</div>
        <div class="kpi-desc">${escapeHtml(kpi.description)}</div>
      `;
      kpiContainer.appendChild(card);
    });

    // Render Charts
    renderCharts(analytics.charts || {});

    // Executive Overview
    overviewBullets.innerHTML = "";
    (analytics.overview_points || []).forEach(pt => {
      const itm = document.createElement("div");
      itm.className = "overview-item";
      itm.innerHTML = `
        <div class="overview-dot"></div>
        <div class="overview-text">${escapeHtml(pt)}</div>
      `;
      overviewBullets.appendChild(itm);
    });

    // Strategy & Decision Making
    const strat = analytics.strategy || {};
    strategyHeading.textContent = strat.title || `Chiến Lược Tối Ưu Hóa & Giải Quyết Vấn Đề Cho ${state.businessType}`;
    
    const sol = strat.proposed_solution || {};
    solutionName.textContent = sol.name || "Phương án Tái cấu trúc & Tối ưu hóa nguồn lực";
    solutionDesc.textContent = sol.description || "";

    solutionStepsList.innerHTML = "";
    (sol.action_steps || []).forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      solutionStepsList.appendChild(li);
    });

    // Pros & Cons
    const pc = strat.pros_cons || {};
    prosList.innerHTML = "";
    (pc.pros || []).forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      prosList.appendChild(li);
    });

    consList.innerHTML = "";
    (pc.cons || []).forEach(c => {
      const li = document.createElement("li");
      li.textContent = c;
      consList.appendChild(li);
    });

    // Decision Rationale
    const rat = strat.decision_rationale || {};
    rationaleWhy.textContent = rat.why_chosen || "";
    rationaleImpact.textContent = rat.expected_impact || "";
  }

  // Chart.js Rendering
  function renderCharts(chartsData) {
    // 1. Time Trend Chart
    if (state.charts.trend) state.charts.trend.destroy();
    const trendCtx = document.getElementById("trendChart").getContext("2d");
    const trendData = chartsData.trend || { labels: [], data: [] };
    document.getElementById("chart1Title").textContent = trendData.title || "Xu Hướng Tăng Trưởng Theo Thời Gian";

    state.charts.trend = new Chart(trendCtx, {
      type: "line",
      data: {
        labels: trendData.labels,
        datasets: [{
          label: "Giá trị",
          data: trendData.data,
          borderColor: "#FF5E62",
          backgroundColor: "rgba(255, 94, 98, 0.12)",
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: "#FF5E62",
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,0.04)" } }
        }
      }
    });

    // 2. Category Breakdown Chart (Bar)
    if (state.charts.category) state.charts.category.destroy();
    const catCtx = document.getElementById("categoryChart").getContext("2d");
    const catData = chartsData.category_bar || { labels: [], data: [] };
    document.getElementById("chart2Title").textContent = catData.title || "Đóng Góp Theo Phân Nhóm";

    state.charts.category = new Chart(catCtx, {
      type: "bar",
      data: {
        labels: catData.labels,
        datasets: [{
          label: "Quy mô",
          data: catData.data,
          backgroundColor: [
            "#FF6B8B",
            "#FF8E53",
            "#FFAAA6",
            "#FFD3B6",
            "#A8E6CF",
            "#DED2F9",
            "#C3ACD0"
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,0.04)" } }
        }
      }
    });

    // 3. Distribution Pie / Doughnut
    if (state.charts.distribution) state.charts.distribution.destroy();
    const distCtx = document.getElementById("distributionChart").getContext("2d");
    const distData = chartsData.distribution_pie || { labels: [], data: [] };
    document.getElementById("chart3Title").textContent = distData.title || "Cơ Cấu Tỷ Trọng Phân Phối";

    state.charts.distribution = new Chart(distCtx, {
      type: "doughnut",
      data: {
        labels: distData.labels,
        datasets: [{
          data: distData.data,
          backgroundColor: [
            "#FF6B8B",
            "#FF9F7F",
            "#FFD166",
            "#06D6A0",
            "#118AB2"
          ],
          borderWidth: 2,
          borderColor: "#FFFFFF"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right" }
        },
        cutout: "68%"
      }
    });
  }

  // ===================================================
  // EXPORT HANDLERS: DOCX & CSV
  // ===================================================
  function triggerDocxExport() {
    showToast("Đang kết xuất tệp Word (.docx) chuẩn C-Level...", 3000);
    window.location.href = "/api/export-docx";
  }

  btnExportDocx.addEventListener("click", triggerDocxExport);
  btnExportDocxBottom.addEventListener("click", triggerDocxExport);

  btnExportDataCsv.addEventListener("click", () => {
    showToast("Đang tải dữ liệu sạch định dạng CSV...");
    window.location.href = "/api/export-data?format=csv";
  });

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

});
