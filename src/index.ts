import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import Graphene from 'gi://Graphene?version=1.0';
import './dom.js'
import vancore from 'vanjs-core'
import type { Tags, Van, State, ChildDom, ValidChildDomValue, BindingFunc, SingleChildDom, WidgetCtorProps, WidgetReactiveProps } from './van.d.ts'
import c from 'gi://cairo?version=1.0'
import * as ex from './ex'
const tags = vancore.tags as any as Tags
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
  Switch,
  Scale,
  FlowBox,
  Fixed,
  DrawingArea,
  Notebook,
} = vancore.tags as any as Tags

export type ReactiveVal<T> = T | State<T> | (() => T)
type ChildWidget<T extends Gtk.Widget = Gtk.Widget> = T | (() => T) | string

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
    ex.put(child, {
      name: props.name,
      title: valueOf(props.title)
    })
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

function toWidget(input: ChildWidget): Gtk.Widget {
  if (typeof input === 'string' ||
    typeof input === 'number' ||
    typeof input === 'boolean' ||
    typeof input === 'bigint'
  ) {
    return new Gtk.Label({ label: String(input) })
  }
  if (typeof input === 'function') {
    return input()
  }
  return input
}


export function NotebookItem(title: string | Gtk.Widget, child: Gtk.Widget) {
  if (typeof title === 'string' || typeof title === 'number') {
    const l = new Gtk.Label({ label: String(title) })
    ex.put(child, l)
    return child
  } else {
    ex.put(child, title)
    return child
  }
}

export function FixedItem(props: {
  x: ReactiveVal<number>, y: ReactiveVal<number>
}, child: Gtk.Widget) {
  return (dom: Gtk.Widget | undefined) => {
    const x = valueOf(props.x)
    const y = valueOf(props.y)
    if (dom) {
      const parent = dom.parent as Gtk.Fixed
      if (parent) {
        dom.unparent()
        parent.put(child, x, y)
      }
    }
    ex.put(child, {
      x, y
    })
    return child
  }
}

export function Overlay(
  overlay: Gtk.Widget | (() => Gtk.Widget),
  child: Gtk.Widget
) {
  return () => {
    const o = toWidget(overlay)
    const w = tags.Overlay()
    w.add_overlay(new Gtk.Label({ label: 'test' }))
    w.child = child
    return w
  }
}

export function VFLContainer(
  props: { vfl: ReactiveVal<string[]> },
  ...children: ChildDom[]
) {
  const box = Box({
    layoutManager: () => {
      const vfl = valueOf(props.vfl)
      const layout = new Gtk.ConstraintLayout()
      setTimeout(() => {
        const childWidgets: Gtk.Widget[] = []
        let child = box.get_first_child();
        for (; child != null; child = child.get_next_sibling()) {
          if (child) {
            childWidgets.push(child)
          }
        }
        layout.add_constraints_from_description(vfl, 0, 0, Object.fromEntries(
          childWidgets.map(child => [child.name, child])
        ))
      }, 10)
      return layout
    }
  },
    ...children
  )
  return box
}

function t(props: Partial<Gtk.Button.ConstructorProps>) {

}

export function Spinner(props: WidgetReactiveProps['Spinner']) {
  const { spinning, ...rest } = props
  const spinner = tags.Spinner(rest)
  const b = tags.Button()
  vancore.derive(() => {
    if (valueOf(props.spinning)) {
      spinner.start()
    } else {
      spinner.stop()
    }
  })
  return spinner
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
