import { customElement, property } from '@polymer/decorators';
import '@polymer/marked-element';
import { html, PolymerElement } from '@polymer/polymer';
import 'plastic-image';
import { Post } from '../models/post';
import { router } from '../router';
import { getDate } from '../utils/functions';
import './shared-styles';
import './text-truncate';

@customElement('posts-list')
export class PostsList extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles flex flex-alignment positioning">
        :host {
          display: block;
        }

        .post {
          padding: 24px 0;
          display: block;
          color: var(--primary-text-color);
        }

        .post:not(:last-of-type) {
          border-bottom: 1px dotted var(--divider-color);
        }

        .image {
          margin-right: 24px;
          width: 64px;
          height: 64px;
          border-radius: var(--border-radius);
        }

        .details {
          height: 100%;
        }

        .title {
          line-height: 1.2;
        }

        .description {
          margin-top: 8px;
          color: var(--secondary-text-color);
        }

        .date {
          font-size: 12px;
          text-transform: uppercase;
          color: var(--secondary-text-color);
        }

        @media (min-width: 640px) {
          .image {
            width: 128px;
            height: 128px;
          }
        }
      </style>

      <template is="dom-repeat" items="[[posts]]" as="post">
        <a href$="[[postUrl(post.id)]]" class="post" layout horizontal>
          <plastic-image
            class="image"
            srcset="[[post.image]]"
            style$="background-color: [[post.backgroundColor]];"
            sizing="cover"
            hidden$="[[!post.image]]"
            lazy-load
            preload
            fade
          ></plastic-image>
          <div flex>
            <div class="details" layout vertical justified>
              <div>
                <text-truncate lines="2">
                  <h2 class="title">[[post.title]]</h2>
                </text-truncate>
                <text-truncate lines="3">
                  <marked-element class="description" markdown="[[post.brief]]">
                    <div slot="markdown-html"></div>
                  </marked-element>
                </text-truncate>
              </div>
              <span class="date">[[getDate(post.published)]]</span>
            </div>
          </div>
        </a>
      </template>
    `;
  }

  @property({ type: Array })
  posts: Post[] = [];

  postUrl(id: string) {
    return router.urlForName('post-page', { id });
  }

  getDate(date: string) {
    return getDate(date);
  }
}
