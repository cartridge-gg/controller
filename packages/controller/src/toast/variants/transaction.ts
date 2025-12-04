import { TransactionToastOptions } from "../types";
import { CloseButton } from "../components/close-button";

// Inject transaction toast specific styles
export function injectTransactionStyles(targetDoc: Document): void {
  if (targetDoc.getElementById("cartridge-toast-transaction-styles")) {
    return;
  }

  const style = targetDoc.createElement("style");
  style.id = "cartridge-toast-transaction-styles";
  style.textContent = `
    /* Transaction Toast */
    .cartridge-toast.transaction {
      background-color: #161A17;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    /* Expanded State */
    .cartridge-toast.transaction.expanded {
      width: 360px;
    }

    .cartridge-toast.transaction.expanded .toast-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
      box-sizing: border-box;
    }

    .cartridge-toast.transaction.expanded .label-bar {
      display: flex;
      align-items: center;
      padding: 12px;
      gap: 8px;
      flex: 1 0 0;
    }

    .cartridge-toast.transaction.expanded .label-bar .label-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cartridge-toast.transaction.expanded .label-bar .icon-container {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cartridge-toast.transaction.expanded .label-bar p.status {
      color: #FFF;
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      margin: 0;
    }

    .cartridge-toast.transaction.expanded .label-bar .activity-feed-container {
      display: flex;
      padding: 2px;
      align-items: center;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.08);
    }

    .cartridge-toast.transaction.expanded .label-bar .activity-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cartridge-toast.transaction.expanded .label-bar .activity-label-container {
      display: flex;
      padding: 0 2px;
      justify-content: center;
      align-items: center;
    }

    .cartridge-toast.transaction.expanded .label-bar span.activity-label {
      color: #3F3;
      font-family: Inter;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }

    .cartridge-toast.transaction.expanded .close-button-container {
      display: flex;
      align-items: center;
    }

    /* Progress Bar - will be added dynamically */
    .cartridge-toast.transaction .cartridge-toast-progress-bar {
      background: rgba(255, 255, 255, 0.1);
    }

    .cartridge-toast.transaction .cartridge-toast-progress-bar-fill {
      background: #3F3;
    }

    /* Collapsed State */
    .cartridge-toast.transaction.collapsed {
      display: inline-flex;
      padding: 10px;
      align-items: center;
      justify-content: center;
    }

    .cartridge-toast.transaction.collapsed .collapsed-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Spinner Animation */
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .cartridge-toast.transaction .icon-container.spinning,
    .cartridge-toast.transaction .collapsed-icon.spinning {
      animation: spin 1s linear infinite;
    }
  `;
  targetDoc.head.appendChild(style);
}

// Create transaction toast element
export function createTransactionToast(
  options: TransactionToastOptions,
): HTMLElement {
  const toast = document.createElement("div");
  toast.className = `cartridge-toast transaction ${options.isExpanded ? "expanded" : "collapsed"}`;

  if (options.isExpanded) {
    // Create main content container
    const toastContent = document.createElement("div");
    toastContent.className = "toast-content";

    // Create label bar
    const labelBar = document.createElement("div");
    labelBar.className = "label-bar";

    const labelContainer = document.createElement("div");
    labelContainer.className = "label-container";

    // Create icon container
    const iconContainer = document.createElement("div");
    iconContainer.className = "icon-container";
    if (options.status === "confirming") {
      iconContainer.classList.add("spinning");
      iconContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M11.1111 5.77756C11.1111 5.28673 11.5083 4.88867 12 4.88867C15.9278 4.88867 19.1111 8.07201 19.1111 11.9998C19.1111 13.2942 18.7639 14.5109 18.1583 15.5553C17.9139 15.9803 17.3694 16.1276 16.9194 15.8803C16.5194 15.6359 16.375 15.0914 16.6194 14.6414C17.0722 13.8831 17.3333 12.972 17.3333 11.9748C17.3333 9.03034 14.9444 6.64145 12 6.64145C11.5083 6.64145 11.1111 6.26839 11.1111 5.75256V5.77756Z" fill="white"/>
          <path opacity="0.25" d="M11.975 6.66645C9.03058 6.66645 6.64169 9.03034 6.64169 11.9998C6.64169 14.9442 9.03058 17.3331 11.975 17.3331C13.9472 17.3331 15.6472 16.2914 16.5806 14.7331L16.5834 14.7359C16.3917 15.1498 16.5417 15.647 16.9195 15.8803C17.3695 16.1276 17.9139 15.9803 18.1584 15.5553C18.1639 15.547 18.1695 15.5387 18.1722 15.5303C16.9472 17.6692 14.6417 19.1109 12 19.1109C8.07225 19.1109 4.88892 15.9276 4.88892 11.9998C4.88892 8.07201 8.07225 4.88867 12 4.88867C11.5084 4.88867 11.1111 5.28673 11.1111 5.77756C11.1111 6.26839 11.5084 6.66645 12 6.66645H11.975Z" fill="white" fill-opacity="0.64"/>
        </svg>
      `;
    } else {
      iconContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8.36382 18.5465L4 14.1827L5.45427 12.7284L8.36382 15.638L18.5457 5.45508L20 6.91032L8.36382 18.5465Z" fill="#33FF33"/>
        </svg>
      `;
    }

    // Create status text
    const status = document.createElement("p");
    status.className = "status";
    status.textContent =
      options.status === "confirming" ? "Confirming" : "Confirmed";

    labelContainer.appendChild(iconContainer);
    labelContainer.appendChild(status);

    // Add activity label if provided
    if (options.label) {
      const activityFeedContainer = document.createElement("div");
      activityFeedContainer.className = "activity-feed-container";

      const activityIcon = document.createElement("div");
      activityIcon.className = "activity-icon";
      activityIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M7.985 4.0002C8.23167 3.99353 8.45 4.1552 8.515 4.39353L9.74833 8.91353L10.0433 8.32353C10.2233 7.96187 10.5933 7.73353 10.9967 7.73353H12.8C13.095 7.73353 13.3333 7.97187 13.3333 8.26687C13.3333 8.56187 13.095 8.8002 12.8 8.8002H10.9967L10.0767 10.6385C9.97833 10.8369 9.76667 10.9519 9.54667 10.9302C9.32667 10.9085 9.14333 10.7535 9.085 10.5402L8.06167 6.78853L6.92167 12.1119C6.87 12.3519 6.66333 12.5252 6.41833 12.5335C6.17333 12.5419 5.955 12.3819 5.88833 12.1469L4.93167 8.8002H3.2C2.905 8.8002 2.66667 8.56187 2.66667 8.26687C2.66667 7.97187 2.905 7.73353 3.2 7.73353H4.93167C5.40833 7.73353 5.82667 8.04853 5.95667 8.50687L6.32667 9.8002L7.47833 4.42187C7.53 4.18187 7.74 4.00687 7.985 4.0002Z" fill="#33FF33"/>
        </svg>
      `;

      const activityLabelContainer = document.createElement("div");
      activityLabelContainer.className = "activity-label-container";

      const activityLabel = document.createElement("span");
      activityLabel.className = "activity-label";
      activityLabel.textContent = options.label;

      activityLabelContainer.appendChild(activityLabel);
      activityFeedContainer.appendChild(activityIcon);
      activityFeedContainer.appendChild(activityLabelContainer);
      labelContainer.appendChild(activityFeedContainer);
    }

    labelBar.appendChild(labelContainer);
    toastContent.appendChild(labelBar);

    // Create close button
    const closeButtonContainer = document.createElement("div");
    closeButtonContainer.className = "close-button-container";
    const closeButton = CloseButton();
    closeButtonContainer.appendChild(closeButton);
    toastContent.appendChild(closeButtonContainer);

    toast.appendChild(toastContent);
  } else {
    // Collapsed state
    const collapsedIcon = document.createElement("div");
    collapsedIcon.className = "collapsed-icon";

    if (options.status === "confirming") {
      collapsedIcon.classList.add("spinning");
      collapsedIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M12.9629 6.74016C12.9629 6.16752 13.4264 5.70312 14 5.70312C18.5824 5.70312 22.2963 9.41701 22.2963 13.9994C22.2963 15.5096 21.8912 16.9291 21.1847 18.1476C20.8995 18.6434 20.2643 18.8152 19.7393 18.5267C19.2727 18.2416 19.1041 17.6064 19.3893 17.0814C19.9176 16.1966 20.2222 15.1337 20.2222 13.9703C20.2222 10.5351 17.4352 7.74803 14 7.74803C13.4264 7.74803 12.9629 7.3128 12.9629 6.711V6.74016Z" fill="white"/>
          <path opacity="0.25" d="M13.9709 7.7772C10.5357 7.7772 7.74864 10.5351 7.74864 13.9994C7.74864 17.4346 10.5357 20.2216 13.9709 20.2216C16.2718 20.2216 18.2551 19.0064 19.344 17.1883L19.3473 17.1916C19.1236 17.6744 19.2986 18.2545 19.7394 18.5267C20.2644 18.8152 20.8996 18.6434 21.1848 18.1476C21.1912 18.1378 21.1977 18.1281 21.201 18.1184C19.7718 20.6138 17.082 22.2957 14 22.2957C9.41762 22.2957 5.70374 18.5818 5.70374 13.9994C5.70374 9.41701 9.41762 5.70312 14 5.70312C13.4264 5.70312 12.963 6.16752 12.963 6.74016C12.963 7.3128 13.4264 7.7772 14 7.7772H13.9709Z" fill="white" fill-opacity="0.64"/>
        </svg>
      `;
    } else {
      collapsedIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M9.75779 21.6366L4.66667 16.5455L6.36332 14.8489L9.75779 18.2433L21.6367 6.36328L23.3333 8.06107L9.75779 21.6366Z" fill="#33FF33"/>
        </svg>
      `;
    }

    toast.appendChild(collapsedIcon);
  }

  return toast;
}
