import { customElement, property } from '@polymer/decorators';
import '@polymer/marked-element';
import { html, PolymerElement } from '@polymer/polymer';
import { offsetTop, scrollToY } from '../utils/scrolling';
import './shared-styles';

@customElement('md-content')
export class MdContent extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles flex flex-alignment">
        :host {
          display: block;
        }

        .content-wrapper {
          background-color: var(--secondary-background-color);
          width: 100%;
          overflow: hidden;
          transition: opacity var(--animation), opacity var(--animation);
          opacity: 0;
        }

        .content-wrapper.visible {
          opacity: 1;
        }

        .col {
          font-size: 32px;
          line-height: 48px;
          margin-bottom: 24px;
          z-index: 2;
        }

        .col-content {
          line-height: 32px;
          display: block;
          font-size: 16px;
        }

        [slot='markdown-html'] h2 {
          line-height: 2;
        }

        [slot='markdown-html'] h3::after {
          margin-left: 8px;
          content: '';
          display: inline-block;
          width: 1.1em;
          height: 1em;
          background: url('../../images/link-icon.svg') no-repeat;
          background-size: contain;
          cursor: pointer;
          vertical-align: middle;
        }

        @media (min-width: 640px) {
          .content,
          .markdown-text {
            padding: 0 18px;
          }

          .col {
            margin-right: 24px;
          }

          .col:last-of-type {
            margin-right: 0;
          }

          [slot='markdown-html'] h2 {
            font-size: 40px;
            width: 40%;
            margin-bottom: 25px;
            display: inline-block;
            transform: translateY(85%);
            vertical-align: bottom;
            line-height: 1;
          }

          [slot='markdown-html'] h3 {
            line-height: 1.5;
          }

          [slot='markdown-html'] h3,
          [slot='markdown-html'] h4,
          [slot='markdown-html'] p,
          [slot='markdown-html'] ol,
          [slot='markdown-html'] ul {
            margin-right: 40%;
          }

          [slot='markdown-html'] h3::after {
            display: none;
          }

          [slot='markdown-html'] h3:hover::after {
            display: inline-block;
          }
        }

        @media (min-width: 812px) {
          .content,
          .markdown-text {
            padding: 0 40px;
          }
        }
      </style>

      <div class="content-wrapper">
        <div class="container">
          <div class="content" layout justified horizontal wrap></div>
        </div>
      </div>
      <div class="container">
        <marked-element class="markdown-text">
          <div slot="markdown-html"></div>
          <script type="text/markdown" src$="[[mdSource]]"></script>
        </marked-element>
      </div>
    `;
  }

  @property({ type: String })
  mdSource: string;
  @property({ type: Number })
  private toolbarOffset = 70;

  constructor() {
    super();
    this._scrollToChapter = this._scrollToChapter.bind(this);
    this._changeUrl = this._changeUrl.bind(this);
  }

  override ready() {
    super.ready();
    this.addEventListener('marked-render-complete', this._renderContent);
  }

  override connectedCallback() {
    super.connectedCallback();

    if (window.location.hash) {
      window.setTimeout(() => {
        const id = window.location.hash.slice(1).split('#')[0];
        const element = this.shadowRoot.querySelector(`[id="${id}"]`);
        if (!element) return;
        const offset = offsetTop(element);
        scrollToY(offset - this.toolbarOffset, 100);
      }, 500);
    }
  }

  _renderContent() {
    const heads = this.shadowRoot.querySelectorAll('.markdown-text h3');
    const contentDom = this.shadowRoot.querySelector('.content');
    let lastHeadElement;

    for (let i = 0; i < heads.length; i++) {
      if (heads[i].previousElementSibling && heads[i].previousElementSibling.nodeName === 'H2') {
        const head2Element = heads[i].previousElementSibling;
        const colHeader = document.createElement('div');
        colHeader.className = `col ${head2Element.id}`;
        colHeader.textContent = head2Element.textContent;
        contentDom.appendChild(colHeader);
        lastHeadElement = colHeader;
      }

      if (!lastHeadElement) {
        const col = document.createElement('div');
        col.className = 'col';
        contentDom.appendChild(col);
        lastHeadElement = col;
      }

      const colContent = document.createElement('a');
      colContent.className = 'col-content';
      colContent.href = `#${heads[i].id}`;
      colContent.textContent = heads[i].textContent;
      colContent.addEventListener('click', this._scrollToChapter);
      lastHeadElement.appendChild(colContent);

      heads[i].addEventListener('click', this._changeUrl);
    }

    const contentWrapper = this.shadowRoot.querySelector('.content-wrapper');
    contentWrapper.classList.add('visible');
  }

  _scrollToChapter(e) {
    e.preventDefault();
    const elementIdToScroll = e.target.getAttribute('href');
    const element = this.shadowRoot.querySelector(`[id="${elementIdToScroll.slice(1)}"]`);
    const offset = offsetTop(element);
    scrollToY(offset - this.toolbarOffset, 1500, 'easeInOutSine');
    window.location.hash = elementIdToScroll;
  }

  _changeUrl(e) {
    const targetElement = e.path && e.path[0];
    const offset = offsetTop(targetElement);
    const canBeScrolled =
      Math.abs(document.documentElement.scrollTop + this.toolbarOffset - offset) >= 50;
    if (canBeScrolled) {
      scrollToY(offset - this.toolbarOffset, 100);
    }

    window.location.hash = targetElement.id;
    this._copyTextToClipboard(window.location.href);
  }

  _copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this._fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text);
  }

  _fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}
