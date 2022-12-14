/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Bootstraps the animated hero
 */
export class HeroAnimated {
  /**
   * Creates an instance of HeroAnimated.
   * @param {HTMLElement} element – Hero HTML element.
   */
  constructor(element) {
    // Create a set of constants to be reused throughout the class.
    const constants = {
      animation: {
        name: 'Hero',
      },
      selectors: {
        wrapper: '[data-wrapper]',
        fallback: '[data-fallback]',
        img: '[data-static]',
        phosphor: '[data-phosphor]',
      },
      hideClass: 'hero-animated__animation-item--hide',
    };
    this.constants_ = Object.freeze(constants);

    this.elem_ = element;
    this.backgroundImage_ = this.elem_.querySelector(this.constants_.selectors.img);
    this.fallbackImage_ = this.elem_.querySelector(this.constants_.selectors.fallback);
    this.phosphorImage_ = this.elem_.querySelector(this.constants_.selectors.phosphor);
    this.animation_ = {};

    // Start the animation in case lottie loaded before the background image.
    if (!this.backgroundImage_.complete) {
      this.backgroundImage_.addEventListener('load', this.startIfReady_.bind(this));
    }

    document.body.addEventListener('themechange', ({ detail }) => {
      this.useTheme(detail?.name);
    });
  }

  /**
   * Loads the animation.
   * @param {Object} lottie - The lottie library.
   * @param {Object} animationData – The animation data.
   */
  async loadAnimation(lottie, animationData) {
    this.lottie_ = lottie;

    /** @type {AnimationConfig} */
    this.animationConfig_ = {
      container: this.elem_.querySelector(this.constants_.selectors.wrapper),
      animType: 'svg',
      loop: true,
      animationData: animationData,
      autoplay: false,
      name: this.constants_.animation.name,
      rendererSettings: {
        progressiveLoad: true,
      },
    };

    this.init_();
  }

  /**
   * Check for user preferences and use the theme to apply the corresponding animation.
   * @param {string} name - Name of current theme.
   * @return {void}
   */
  async useTheme(name) {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const phosphor = name === 'phosphor';
      let lottie;
      let animationData;

      if (phosphor) {
        [{ default: lottie }, { animationData }] = await Promise.all([import('lottie-web/build/player/lottie_svg.min.js'), import('../animations/phosphor')]);
      } else {
        [{ default: lottie }, { animationData }] = await Promise.all([import('lottie-web/build/player/lottie_svg.min.js'), import('../animations/home')]);
      }

      this.loadAnimation(lottie, animationData);
    } else {
      this.showMotionFallback();
    }
  }

  /**
   * Removes the class that hides the fallback asset and adds it to the background Image.
   */
  showMotionFallback() {
    this.fallbackImage_.classList.remove(this.constants_.hideClass);
    this.backgroundImage_.classList.add(this.constants_.hideClass);
    this.phosphorImage_.classList.add(this.constants_.hideClass);
  }

  /**
   * Inits the animation and sets the event handlers. Destroys the previous animation if applicable.
   */
  init_() {
    if (Object.keys(this.animation_).length) {
      this.animation_.destroy();
    }
    this.animation_ = this.lottie_.loadAnimation(this.animationConfig_);
    this.animation_.hide();

    // Animation loaded handlers.
    this.animation_.addEventListener('DOMLoaded', () => {
      this.startIfReady_(this.animation_);
    });

    // Something went wrong handlers.
    this.animation_.addEventListener('error', () => {
      console.error(`Something went wrong and the ${this.animation_.name} animation failed to load! 😭`);
    });

    this.animation_.addEventListener('data_failed', () => {
      console.error(`Something went wrong and the ${this.animation_.name} animation data failed to load! 😭`);
    });
  }

  /**
   * Starts the animation if the background image and the animation are loaded.
   */
  startIfReady_() {
    if (this.backgroundImage_.complete && this.animation_.isLoaded) {
      this.backgroundImage_.classList.add(this.constants_.hideClass);
      this.phosphorImage_.classList.add(this.constants_.hideClass);
      this.animation_.show();
      this.animation_.play();
    }
  }
}
