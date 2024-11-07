import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import './dom.js'
import vancore from 'vanjs-core'
import type { Tags, Van } from './van.d.ts'
export const {
  Button, Box, Label
} = vancore.tags as any as Tags
export const van = {
  state: vancore.state,
  derive: vancore.derive,
  add: vancore.add as any as Van["add"],
  tags: vancore.tags as any as Tags,
}

export function app(win: () => Gtk.Window) {
  Gtk.init()
  const window = win();
  const loop = GLib.MainLoop.new(null, false);
  const chainable = {
    exitOnClose: () => {
      window.connect('close-request', () => {
        loop.quit();
      })
      return chainable
    },
    run: () => {
      window.present();
      loop.run();
    }
  }
  return chainable
}
