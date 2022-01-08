import { Failure, Initialized, Pending, Success } from '@abraham/remotedata';
import { computed, customElement, property } from '@polymer/decorators';
import '@polymer/iron-icon';
import '@polymer/paper-button';
import { html, PolymerElement } from '@polymer/polymer';
import 'plastic-image';
import { ReduxMixin } from '../mixins/redux-mixin';
import { RootState, store } from '../store';
import { closeDialog, openDialog, setDialogError } from '../store/dialogs/actions';
import { DIALOG, DialogForm } from '../store/dialogs/types';
import { fetchPartners } from '../store/partners/actions';
import { initialPartnersState } from '../store/partners/state';
import { addPotentialPartner } from '../store/potential-partners/actions';
import {
  initialPotentialPartnersState,
  PotentialPartnersState,
} from '../store/potential-partners/state';
import { showToast } from '../store/toast/actions';
import './hoverboard-icons';
import './shared-styles';

@customElement('partners-block')
export class PartnersBlock extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="shared-styles flex flex-alignment">
        :host {
          display: block;
        }

        .block-title {
          margin: 24px 0 8px;
        }

        .logos-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          grid-gap: 8px;
        }

        .logo-item {
          padding: 12px;
        }

        .logo-img {
          height: 84px;
          width: 100%;
        }

        .cta-button {
          margin-top: 24px;
          color: var(--default-primary-color);
        }

        @media (min-width: 640px) {
          .logos-wrapper {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (min-width: 812px) {
          .logos-wrapper {
            grid-template-columns: repeat(5, 1fr);
          }
        }
      </style>

      <div class="container">
        <h1 class="container-title">{$ partnersBlock.title $}</h1>

        <template is="dom-if" if="[[pending]]">
          <p>Loading...</p>
        </template>
        <template is="dom-if" if="[[failure]]">
          <p>Error loading sponsors.</p>
        </template>

        <template is="dom-repeat" items="[[partners.data]]" as="block">
          <h4 class="block-title">[[block.title]]</h4>
          <div class="logos-wrapper">
            <template is="dom-repeat" items="[[block.items]]" as="logo">
              <a
                class="logo-item"
                href$="[[logo.url]]"
                title$="[[logo.name]]"
                target="_blank"
                rel="noopener noreferrer"
                layout
                horizontal
                center-center
              >
                <plastic-image
                  class="logo-img"
                  srcset="[[logo.logoUrl]]"
                  sizing="contain"
                  lazy-load
                  preload
                  fade
                ></plastic-image>
              </a>
            </template>
          </div>
        </template>
      </div>
    `;
  }

  @property({ type: Object, observer: PartnersBlock.prototype._partnerAddingChanged })
  potentialPartners = initialPotentialPartnersState;
  @property({ type: Object })
  partners = initialPartnersState;

  @computed('partners')
  get pending() {
    return this.partners instanceof Pending;
  }

  @computed('partners')
  get failure() {
    return this.partners instanceof Failure;
  }

  override stateChanged(state: RootState) {
    this.partners = state.partners;
    this.potentialPartners = state.potentialPartners;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.partners instanceof Initialized) {
      store.dispatch(fetchPartners);
    }
  }

  _addPotentialPartner() {
    openDialog(DIALOG.SUBSCRIBE, {
      title: '{$ partnersBlock.form.title $}',
      submitLabel: '{$ partnersBlock.form.submitLabel $}',
      firstFieldLabel: '{$ partnersBlock.form.fullName $}',
      secondFieldLabel: '{$ partnersBlock.form.companyName $}',
      submit: (data: DialogForm) => {
        store.dispatch(addPotentialPartner(data));
      },
    });
  }

  _partnerAddingChanged(potentialPartners: PotentialPartnersState) {
    if (potentialPartners instanceof Success) {
      closeDialog();
      showToast({ message: '{$ partnersBlock.toast $}' });
    } else if (potentialPartners instanceof Failure) {
      setDialogError(potentialPartners.error);
    }
  }
}
