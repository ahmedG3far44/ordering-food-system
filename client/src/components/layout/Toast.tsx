import { Toaster as SonnerToaster } from 'sonner';

const ToastStyles = () => (
  <style>{`
    [data-sonner-toaster] {
      --font: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace !important;
      --normal-bg: #ffffff;
      --normal-border: var(--primary);
      --normal-text: var(--primary);
      --success-bg: #ffffff;
      --success-border: var(--primary);
      --success-text: var(--primary);
      --error-bg: #ffffff;
      --error-border: #dc2626;
      --error-text: #dc2626;
      --width: 380px;
      --gap: 12px;
    }

    [data-sonner-toast] {
      border: 3px solid var(--primary) !important;
      border-radius: 0 !important;
      box-shadow: 4px 4px 0px 0px var(--primary) !important;
      padding: 16px 20px !important;
      font-family: var(--font) !important;
      gap: 12px !important;
    }

    [data-sonner-toast][data-type="error"] {
      border-color: #dc2626 !important;
      box-shadow: 4px 4px 0px 0px #dc2626 !important;
    }

    [data-sonner-toast][data-type="error"] [data-close-button] {
      background: #dc2626 !important;
      border-color: #dc2626 !important;
    }

    [data-sonner-toast] [data-title] {
      font-size: 12px !important;
      font-weight: 900 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.02em !important;
      line-height: 1.3 !important;
    }

    [data-sonner-toast] [data-description] {
      font-size: 11px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.01em !important;
      color: #64748b !important;
      line-height: 1.4 !important;
    }

    [data-sonner-toast] [data-icon] {
      margin-right: 4px !important;
    }

    [data-sonner-toast] [data-close-button] {
      border-radius: 0 !important;
      border: 2px solid var(--primary) !important;
      background: var(--primary) !important;
      color: white !important;
      width: 22px !important;
      height: 22px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: none !important;
      top: 8px !important;
      right: 8px !important;
    }

    [data-sonner-toast] [data-close-button]:hover {
      opacity: 0.8 !important;
    }

    [data-sonner-toast] [data-close-button] svg {
      width: 12px !important;
      height: 12px !important;
    }

    [data-sonner-toast][data-mounted] {
      animation: toast-slide-in 0.3s ease-out !important;
    }

    [data-sonner-toast][data-removed] {
      animation: toast-slide-out 0.2s ease-in forwards !important;
    }

    [data-sonner-toast] [data-content] {
      gap: 4px !important;
    }

    @keyframes toast-slide-in {
      from {
        transform: translateX(100%) translateY(0);
        opacity: 0;
      }
      to {
        transform: translateX(0) translateY(0);
        opacity: 1;
      }
    }

    @keyframes toast-slide-out {
      from {
        transform: translateX(0) translateY(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%) translateY(0);
        opacity: 0;
      }
    }
  `}</style>
);

export const Toaster = () => (
  <>
    <ToastStyles />
    <SonnerToaster
      position="bottom-right"
      closeButton
      toastOptions={{
        duration: 5000,
      }}
    />
  </>
);
