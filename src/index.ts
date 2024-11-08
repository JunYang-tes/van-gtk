import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import './dom.js'
import vancore from 'vanjs-core'
import type { Tags, Van, State } from './van.d.ts'
export const {
  Button,
  Box,
  Label,
  Entry,
  ListBox,
  ListBoxRow,
  ScrolledWindow,
  Stack,
  StackSwitcher,
  StackSidebar,
  Revealer,
} = vancore.tags as any as Tags

const stateProto = Object.getPrototypeOf(vancore.state(0))
export function valueOf(val: any) {
  const proto = Object.getPrototypeOf(val ?? 0)
  if (proto === stateProto) {
    return val.val
  } else if (proto === Function.prototype) {
    return val()
  } else {
    return val
  }
}


export function StackPage(props: {
  name: string,
  title?: string | State<string>
}, child: Gtk.Widget) {
  return () => {
    (child as any)._van_stackMeta = {
      name: props.name,
      title: valueOf(props.title)
    };
    const title = valueOf(props.title)
    if (child.parent) {
      const page = (child.parent as Gtk.Stack)?.get_page(child)
      if (page) {
        page.set_title(title)
      }
    }
    return child
  }
}

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
