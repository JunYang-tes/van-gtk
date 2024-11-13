import Gtk from 'gi://Gtk?version=4.0';

Object.defineProperty(Gtk.Entry.prototype, 'text', {
  get: function () {
    return this.get_text()
  },
  set: function (v) {
    // assign will lead cursor position change
    if (v !== this.get_text()) {
      this.set_text(v)
    }
  }
})

