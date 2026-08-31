(() => {
  "use strict";

  const WHATSAPP_NUMBER = "31641251757";
  const EMAIL_ADDRESS = "Erwin@erwinnootercoaching.nl";

  /*
   * Jaar in de footer
   */
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /*
   * Mobiele navigatie
   */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("navlinks");

  const closeMobileMenu = () => {
    if (!navToggle || !navLinks) {
      return;
    }

    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      navToggle.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

      document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    document.addEventListener("click", (event) => {
      const clickedInsideNavigation =
        navLinks.contains(event.target) ||
        navToggle.contains(event.target);

      if (
        navLinks.classList.contains("open") &&
        !clickedInsideNavigation
      ) {
        closeMobileMenu();
      }
    });
  }

  /*
   * Actieve sectie in navigatie
   */
  const sectionIds = [
    "persoonlijk",
    "wie-ben-ik",
    "relatietherapie",
    "individueel",
    "specialisaties",
    "vraagwijzer",
    "werkwijze",
    "faq",
    "contact"
  ];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navigationAnchors = Array.from(
    document.querySelectorAll(".navlinks a")
  ).filter((anchor) => {
    const href = anchor.getAttribute("href");
    return href && href.startsWith("#");
  });

  const findNavigationAnchor = (hash) => {
    return navigationAnchors.find((anchor) => {
      return anchor.getAttribute("href") === hash;
    });
  };

  if (
    sections.length &&
    navigationAnchors.length &&
    "IntersectionObserver" in window
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => {
            return second.intersectionRatio - first.intersectionRatio;
          });

        if (!visibleEntries.length) {
          return;
        }

        const currentSection = visibleEntries[0].target;

        navigationAnchors.forEach((anchor) => {
          anchor.classList.remove("active");
        });

        const activeAnchor = findNavigationAnchor(
          `#${currentSection.id}`
        );

        if (activeAnchor) {
          activeAnchor.classList.add("active");
        }
      },
      {
        rootMargin: "-30% 0px -58% 0px",
        threshold: [0.01, 0.1, 0.25]
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /*
   * Eén FAQ-item tegelijk geopend houden
   */
  const faqItems = document.querySelectorAll(".faq details");

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });

  /*
   * Interactieve vraagwijzer
   *
   * De antwoorden worden alleen in het huidige browservenster gebruikt.
   * Er wordt niets naar een server gestuurd.
   * Er wordt niets in localStorage opgeslagen.
   */
  const questionForm = document.getElementById("question-form");

  if (!questionForm) {
    return;
  }

  const questionSteps = Array.from(
    questionForm.querySelectorAll(".question-step")
  );

  const nextButtons =
    questionForm.querySelectorAll(".question-next");

  const backButtons =
    questionForm.querySelectorAll(".question-back");

  const progressBar = document.getElementById(
    "question-progress-bar"
  );

  const stepLabel = document.getElementById(
    "question-step-label"
  );

  const progressLabel = document.getElementById(
    "question-progress-label"
  );

  const situationField = document.getElementById("situation");
  const wishField = document.getElementById("wish");

  const messagePreview = document.getElementById(
    "message-preview"
  );

  const situationCount = document.getElementById(
    "situation-count"
  );

  const wishCount = document.getElementById("wish-count");

  const topicError = document.getElementById("topic-error");

  const situationError = document.getElementById(
    "situation-error"
  );

  const wishError = document.getElementById("wish-error");

  const whatsappButton = document.getElementById(
    "send-whatsapp"
  );

  const emailButton = document.getElementById("send-email");

  const resetButton = document.getElementById(
    "question-reset"
  );

  const progressNames = {
    1: "Je situatie",
    2: "Wat er gebeurt",
    3: "Wat je nodig hebt",
    4: "Controleren en versturen"
  };

  let currentStep = 1;

  const getSelectedValue = (name) => {
    const selectedInput = questionForm.querySelector(
      `input[name="${name}"]:checked`
    );

    return selectedInput ? selectedInput.value : "";
  };

  const setError = (element, message) => {
    if (element) {
      element.textContent = message;
    }
  };

  const clearErrors = () => {
    setError(topicError, "");
    setError(situationError, "");
    setError(wishError, "");
  };

  const updateProgress = (stepNumber) => {
    const percentage = stepNumber * 25;

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    if (stepLabel) {
      stepLabel.textContent = `Stap ${stepNumber} van 4`;
    }

    if (progressLabel) {
      progressLabel.textContent =
        progressNames[stepNumber] || "";
    }
  };

  const focusFirstControl = (stepNumber) => {
    const activeStep = questionSteps.find((step) => {
      return Number(step.dataset.step) === stepNumber;
    });

    if (!activeStep) {
      return;
    }

    if (stepNumber === 4 && messagePreview) {
      window.setTimeout(() => {
        messagePreview.focus();
      }, 150);

      return;
    }

    const firstControl = activeStep.querySelector(
      "input, textarea, button"
    );

    if (firstControl) {
      window.setTimeout(() => {
        firstControl.focus();
      }, 150);
    }
  };

  const showStep = (stepNumber) => {
    currentStep = stepNumber;
    clearErrors();

    questionSteps.forEach((step) => {
      const isActive =
        Number(step.dataset.step) === stepNumber;

      step.hidden = !isActive;
      step.classList.toggle("is-active", isActive);
    });

    updateProgress(stepNumber);
    focusFirstControl(stepNumber);
  };

  const validateStep = (stepNumber) => {
    clearErrors();

    if (stepNumber === 1) {
      const topic = getSelectedValue("topic");

      if (!topic) {
        setError(
          topicError,
          "Kies eerst waar je vraag het meeste over gaat."
        );

        const firstTopic = questionForm.querySelector(
          'input[name="topic"]'
        );

        if (firstTopic) {
          firstTopic.focus();
        }

        return false;
      }
    }

    if (stepNumber === 2) {
      const situation = situationField
        ? situationField.value.trim()
        : "";

      if (situation.length < 15) {
        setError(
          situationError,
          "Vertel in minimaal een paar woorden wat er steeds gebeurt."
        );

        if (situationField) {
          situationField.focus();
        }

        return false;
      }
    }

    if (stepNumber === 3) {
      const wish = wishField
        ? wishField.value.trim()
        : "";

      const need = getSelectedValue("need");

      if (wish.length < 10) {
        setError(
          wishError,
          "Schrijf kort op wat je graag anders zou willen."
        );

        if (wishField) {
          wishField.focus();
        }

        return false;
      }

      if (!need) {
        setError(
          wishError,
          "Kies ook wat je op dit moment als eerste zou helpen."
        );

        const firstNeed = questionForm.querySelector(
          'input[name="need"]'
        );

        if (firstNeed) {
          firstNeed.focus();
        }

        return false;
      }
    }

    return true;
  };

  const buildMessage = () => {
    const topic = getSelectedValue("topic");

    const situation = situationField
      ? situationField.value.trim()
      : "";

    const wish = wishField
      ? wishField.value.trim()
      : "";

    const need = getSelectedValue("need");

    return [
      "Hallo Erwin,",
      "",
      "Ik heb via je website mijn vraag op een rij gezet.",
      "",
      `Mijn vraag gaat vooral over: ${topic}.`,
      "",
      "Wat er steeds gebeurt:",
      situation,
      "",
      "Wat ik graag anders zou willen:",
      wish,
      "",
      `Wat mij nu als eerste zou helpen: ${need}.`,
      "",
      "Ik hoor graag je eerste gedachte of een verhelderende vraag. Als dit beter persoonlijk besproken kan worden, sta ik open voor een gratis kennismaking in Veghel.",
      "",
      "Groet,"
    ].join("\n");
  };

  const prepareMessagePreview = () => {
    if (messagePreview) {
      messagePreview.value = buildMessage();
    }
  };

  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextStep = Number(button.dataset.next);

      if (!validateStep(currentStep)) {
        return;
      }

      if (nextStep === 4) {
        prepareMessagePreview();
      }

      showStep(nextStep);
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const previousStep = Number(button.dataset.back);
      showStep(previousStep);
    });
  });

  const updateCharacterCount = (
    field,
    counter,
    maximum
  ) => {
    if (!field || !counter) {
      return;
    }

    counter.textContent =
      `${field.value.length} / ${maximum}`;
  };

  if (situationField) {
    situationField.addEventListener("input", () => {
      updateCharacterCount(
        situationField,
        situationCount,
        900
      );

      if (situationField.value.trim().length >= 15) {
        setError(situationError, "");
      }
    });

    updateCharacterCount(
      situationField,
      situationCount,
      900
    );
  }

  if (wishField) {
    wishField.addEventListener("input", () => {
      updateCharacterCount(
        wishField,
        wishCount,
        700
      );

      if (wishField.value.trim().length >= 10) {
        setError(wishError, "");
      }
    });

    updateCharacterCount(
      wishField,
      wishCount,
      700
    );
  }

  questionForm
    .querySelectorAll('input[name="topic"]')
    .forEach((input) => {
      input.addEventListener("change", () => {
        setError(topicError, "");
      });
    });

  questionForm
    .querySelectorAll('input[name="need"]')
    .forEach((input) => {
      input.addEventListener("change", () => {
        if (
          wishField &&
          wishField.value.trim().length >= 10
        ) {
          setError(wishError, "");
        }
      });
    });

  if (whatsappButton) {
    whatsappButton.addEventListener("click", () => {
      const message = messagePreview
        ? messagePreview.value.trim()
        : "";

      if (!message) {
        return;
      }

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(message)}`;

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  if (emailButton) {
    emailButton.addEventListener("click", () => {
      const message = messagePreview
        ? messagePreview.value.trim()
        : "";

      if (!message) {
        return;
      }

      const subject =
        "Vrijblijvende vraag via erwinnootercoaching.nl";

      const emailUrl =
        `mailto:${EMAIL_ADDRESS}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(message)}`;

      window.location.href = emailUrl;
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      questionForm.reset();

      if (messagePreview) {
        messagePreview.value = "";
      }

      updateCharacterCount(
        situationField,
        situationCount,
        900
      );

      updateCharacterCount(
        wishField,
        wishCount,
        700
      );

      showStep(1);
    });
  }

  questionForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  questionForm.addEventListener("keydown", (event) => {
    if (
      event.key === "Enter" &&
      event.target.tagName !== "TEXTAREA"
    ) {
      event.preventDefault();
    }
  });

  showStep(1);
})();
