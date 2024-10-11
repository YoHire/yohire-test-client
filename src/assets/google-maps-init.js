function initMap() {
  if (window.angularComponentRef && window.angularComponentRef.zone) {
    window.angularComponentRef.zone.run(() => {
      window.angularComponentRef.component.initMap();
    });
  }
}

