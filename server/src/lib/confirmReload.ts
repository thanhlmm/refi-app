export const needConfirm = {
  value: false
};

export const shouldConfirm = () => needConfirm.value;

export const setConfirmReload = (confirm: boolean) => {
  needConfirm.value = confirm;
  console.log(needConfirm)
}