import { doc, setDoc } from 'firebase/firestore';
import { Dispatch } from 'redux';
import { db } from '../../firebase';
import { DialogForm } from '../dialogs/types';
import {
  ADD_POTENTIAL_PARTNER,
  ADD_POTENTIAL_PARTNER_FAILURE,
  ADD_POTENTIAL_PARTNER_SUCCESS,
  PotentialPartnerActions,
} from './types';

const setPartner = async (data: DialogForm) => {
  const id = data.email.replace(/[^\w\s]/gi, '');
  const partner = {
    email: data.email,
    fullName: data.firstFieldValue || '',
    companyName: data.secondFieldValue || '',
  };

  await setDoc(doc(db, 'potentialPartners', id), partner);
};

export const addPotentialPartner =
  (data: DialogForm) => async (dispatch: Dispatch<PotentialPartnerActions>) => {
    dispatch({ type: ADD_POTENTIAL_PARTNER });

    try {
      await setPartner(data);

      dispatch({ type: ADD_POTENTIAL_PARTNER_SUCCESS });
    } catch (error) {
      dispatch({
        type: ADD_POTENTIAL_PARTNER_FAILURE,
        payload: error as Error,
      });
    }
  };
