import { customerCaseEditContact } from "../+state/mock.data";

const editTextKey = "myBooking.edit";
export const paymentContentCard = {
  description: "myBooking.detail.paymentDescription",
  id: "payment",
  title: "myBooking.detail.payment",
  hasSeparatorLine: false,
  editTextKey
};

export const dateContentCard = {
  description: "myBooking.detail.appointmentTimeInfo",
  firstCellIcon: {
    name: "ic_calendar",
    src: "https://assets.example.com/icons/ic_calendar.svg",
    ngTemplate: "cgIcon"
  },
  id: "date",
  subtitle: "myBooking.detail.oclock",
  subtitleTranslationParam: {
    time: "07:30"
  },
  title: "Mi. 07.09.2022",
  hasSeparatorLine: true,
  editTextKey
};

export const contactContactCard = {
  description: `${customerCaseEditContact.email}</br>${customerCaseEditContact.phone.mobile}`,
  id: "contact",
  title: "myBooking.detail.contact",
  hasSeparatorLine: true,
  editTextKey
};

export const toTakeWithContentCard = {
  id: "toTakeWith",
  title: "appointmentConfirmation.texts.appointmentNeccessary",
  hasSeparatorLine: true,
  editTextKey
};

export const damageDateContentCard = {
  description: "01.01.1970",
  id: "damageDate",
  title: "myBooking.detail.damageDate",
  hasSeparatorLine: true,
  editTextKey
};

export const addressContentCard = {
  description: `${customerCaseEditContact.name}</br>${customerCaseEditContact.address.street}</br>${customerCaseEditContact.address.zipCode} ${customerCaseEditContact.address.city}`,
  id: "address",
  title: "myBooking.detail.address",
  hasSeparatorLine: true,
  editTextKey
};

export const lpnContentnCard = {
  description: "K-AA-102",
  id: "lpn",
  title: "myBooking.detail.lpn",
  hasSeparatorLine: true,
  editTextKey
};

export const locationContentCard = {
  description: "",
  firstCellIcon: {
    name: "ic_pin_map_line",
    src: "https://assets.example.com/icons/ic_pin_map_line.svg",
    ngTemplate: "cgIcon"
  },
  id: "location",
  subtitle: "Subbelrather Straße 387<br>50825 Köln",
  title: "myBooking.detail.serviceCenter",
  hasSeparatorLine: true,
  descriptionTranslationParam: {
    city: "Köln"
  },
  editTextKey
};
