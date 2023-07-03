import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import * as ri from 'react-icons/ri';
import { setPage } from '../../../redux/features/page';
import contactImg from '../../../public/assets/images/contact-btn.png';

function OpenContact() {
  const dispatch = useDispatch();
  const page = useSelector((state) => state.page);

  const somePageIsOpened = Object.entries(page)
    .filter(
      (e) =>
        ![
          'friendProfile',
          'groupProfile',
          'groupParticipant',
          'addParticipant',
        ].includes(e[0])
    )
    .some((elem) => !!elem[1]);

  return (
    <button
      type="button"
      className={`
        ${somePageIsOpened && 'scale-0 opacity-0'}
        transition absolute z-10 bottom-0 right-0 -translate-x-6 -translate-y-6 bg-spill-200
        w-10 h-10 rounded-full flex justify-center items-center shadow-xl text-white 
        hover:brightness-110
      `}
      onClick={() => {
        dispatch(setPage({ target: 'contact' }));
      }}
    >
      <img src={contactImg} alt="contact image" className="rounded-3xl" />
    </button>
  );
}

export default OpenContact;
