document.addEventListener("DOMContentLoaded", async () => {
  // 只要页面上存在 .me_li，就自动接管渲染（因此可以全站引用）
  const listEl = document.querySelector(".me_li");
  if (!listEl) return;

  // 1) 拉取 JSON
  let members = [];
  try {
    const res = await fetch("data/members.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load members.json: HTTP ${res.status}`);
    members = await res.json();
    if (!Array.isArray(members)) throw new Error("members.json must be an array");
  } catch (e) {
    console.error(e);
    listEl.innerHTML = `<p style="padding:12px;">Members data load failed.</p>`;
    return;
  }

  // 2) 建索引：id -> member（给弹窗用）
  const byId = new Map(members.map(m => [String(m.id), m]));

  // 3) 清空并自动生成卡片数量（你不用再写任何 me_li_item）
  listEl.innerHTML = members.map(renderCard).join("");

  // 4) 点击打开弹窗（卡片空白处、或绿色详情按钮）
  listEl.addEventListener("click", (e) => {
    const card = e.target.closest(".me_li_item");
    if (!card) return;

    const userId = card.getAttribute("data-user");
    if (!userId) return;

    // 如果点的是普通链接（邮箱/主页），让它正常跳转
    const a = e.target.closest("a");
    if (a && !a.classList.contains("dj")) return;

    // 点详情按钮或卡片空白处 -> 弹窗
    e.preventDefault();
    showUserModal(userId);
  });

  // ========== 下面是渲染与弹窗 ==========
  function renderCard(m) {
    const id = String(m.id ?? "");
    const name = m.name ?? "";
    const role = m.role ?? "";
    // 缺省头像逻辑
    const avatar = m.avatar && m.avatar.trim() !== ""
      ? m.avatar
      : "skin/images/people/default.png";

    const email = normalizeEmail(m.links?.email);
    const github = normalizeUrl(m.links?.github);
    const homepage = normalizeUrl(m.links?.homepage);

    // ✅ 新增：生成 icon 链接；url 无效（# / 空）则输出禁用态
    function linkIcon(url, title, iconSrc, isMail = false) {
      const isDisabled = !url || url === "#";
      if (isDisabled) {
        // 没有链接：不输出 href，避免可点击；加 disabled 样式
        return `
          <a class="disabled" title="${esc(title)}">
            <img src="${esc(iconSrc)}" alt="${esc(title)}">
          </a>
        `;
      }

      // 有链接：正常输出
      const extra = isMail ? "" : ` target="_blank" rel="noopener"`;
      return `
        <a href="${esc(url)}" title="${esc(title)}"${extra}>
          <img src="${esc(iconSrc)}" alt="${esc(title)}">
        </a>
      `;
    }
    
    return `
      <div class="me_li_item me_card_v2" data-user="${esc(id)}">
        <div class="me_photo">
          <img src="${esc(avatar)}" alt="${esc(name)}">
        </div>

        <div class="me_name">${escHtml(name)}</div>
        <div class="me_role">${escHtml(role)}</div>

        <div class="me_li_item_lists">
          ${linkIcon(email, "Email", "skin/images/ico4.svg", true)}
          ${linkIcon(github, "GitHub", "skin/images/ico5.svg")}
          ${linkIcon(homepage, "Homepage", "skin/images/ico7.svg")}
        </div>
      </div>
    `;
  }


  function showUserModal(userId) {
  const m = byId.get(String(userId));
  if (!m) return;

  const overlay = document.getElementById("modalOverlay");
  const container = document.getElementById("modalContainer");
  if (!overlay || !container) {
    alert(m.name || "Member");
    return;
  }

  // ✅ 这些元素都要先拿到（否则你后面 if(titleEl)... 会炸）
  const nameEl = document.getElementById("modalUserName");
  const avatarWrap = document.getElementById("modalAvatar");
  const titleEl = document.getElementById("modalUserTitle");
  const majorEl = document.getElementById("modalUserMajor");
  const statusEl = document.getElementById("modalUserStatus");
  const bodyEl = document.getElementById("modalBodyContent");
  const emailTextEl = document.getElementById("modalUserEmail");
  const roleEl = document.getElementById("modalUserRole");
  // ↑ 左侧头像下面显示邮箱文字用


  if (nameEl) nameEl.textContent = m.name ?? "";

  if (avatarWrap) {
    const img = avatarWrap.querySelector("img");
    if (img) {
      img.src = (m.avatar && m.avatar.trim() !== "") ? m.avatar : "skin/images/people/default.png";
      img.alt = (m.name ?? "") + " avatar";
    }
  }

  if (titleEl) titleEl.textContent = m.title ?? "";
  if (roleEl) roleEl.textContent = m.role ?? "";
  if (statusEl) statusEl.textContent = m.status ?? "";

  // 左侧：邮箱文字（反爬虫显示）
  // 把  abc@xyz.edu.cn  显示成  abc [at] xyz [dot] edu [dot] cn
  if (emailTextEl) {
    const rawEmail = (m.links?.email ?? "").replace(/^mailto:/, "");

    const safeEmail = rawEmail
      .replace(/@/g, " [at] ")
      .replace(/\./g, " [dot] ");

    emailTextEl.textContent = safeEmail;
  }
  
  // ✅ 工具：有链接就启用，没链接/# 就禁用（变灰且不可点）
  function setIcon(iconEl, url, isMail = false) {
    if (!iconEl) return;

    if (!url || url === "#") {
      // 没有链接 → 禁用
      iconEl.removeAttribute("href");
      iconEl.classList.add("disabled");
      iconEl.removeAttribute("target");
      iconEl.removeAttribute("rel");
    } else {
      // 有链接 → 启用
      iconEl.href = url;
      iconEl.classList.remove("disabled");

      if (!isMail) {
        iconEl.target = "_blank";
        iconEl.rel = "noopener";
      } else {
        // mailto 不需要新窗口
        iconEl.removeAttribute("target");
        iconEl.removeAttribute("rel");
      }
    }
  }

  // 右侧三个 icon
  const icons = container.querySelectorAll(".modal-right .modal-icon");
  const email = normalizeEmail(m.links?.email);
  const github = normalizeUrl(m.links?.github);
  const homepage = normalizeUrl(m.links?.homepage);

  // ✅ 统一设置：有值则可点，# / 空则禁用
  if (icons.length >= 1) setIcon(icons[0], email, true); // Email：mailto
  if (icons.length >= 2) setIcon(icons[1], github);      // GitHub
  if (icons.length >= 3) setIcon(icons[2], homepage);    // Homepage

  // 填充主体
  if (bodyEl) {
    bodyEl.innerHTML = "";
    bodyEl.appendChild(section("Profile", m.intro ?? ""));
  }

  // ✅ 显示弹窗（现在不会被上面 ReferenceError 打断了）
  overlay.classList.add("active");
  container.classList.add("active");
  document.body.style.overflow = "hidden";

  bindCloseOnce(overlay, container);
  }


  let closeBound = false;
  function bindCloseOnce(overlay, container) {
    if (closeBound) return;
    closeBound = true;

    const closeBtn = document.getElementById("modalClose");
    const close = () => {
      overlay.classList.remove("active");
      container.classList.remove("active");
      document.body.style.overflow = "";
    };

    if (closeBtn) closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  function section(title, text) {
    const wrap = document.createElement("div");
    wrap.className = "modal-content-section";

    const h3 = document.createElement("h3");
    h3.textContent = title;
    wrap.appendChild(h3);

    // ✅ 把 intro 按空行分段：\n\n => 多个段落 <p>
    const parts = String(text ?? "")
      .split(/\n\s*\n/g)      // 以空行分段（兼容 \n\n / \n \n）
      .map(s => s.trim())
      .filter(Boolean);

    // 没有内容也给一个空段落（避免整个块高度塌）
    if (parts.length === 0) {
      const p = document.createElement("p");
      p.textContent = "";
      wrap.appendChild(p);
      return wrap;
    }

    for (const para of parts) {
      const p = document.createElement("p");
      p.textContent = para;   // ✅ 仍然安全：不注入 HTML
      wrap.appendChild(p);
    }

    return wrap;
  }


  function listSection(title, items) {
    const wrap = document.createElement("div");
    wrap.className = "modal-content-section";
    const h3 = document.createElement("h3");
    h3.textContent = title;
    const ul = document.createElement("ul");
    for (const it of items) {
      const li = document.createElement("li");
      li.textContent = String(it ?? "");
      ul.appendChild(li);
    }
    wrap.appendChild(h3);
    wrap.appendChild(ul);
    return wrap;
  }

  function normalizeEmail(v) {
    if (!v) return "#";
    if (v.startsWith("mailto:")) return v;
    if (v.includes("@")) return "mailto:" + v;
    return v;
  }
  function normalizeUrl(v) {
    return v ? v : "#";
  }

  // escape helpers
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function escHtml(s) { return esc(s); }
});
