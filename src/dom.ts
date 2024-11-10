
import Gtk from 'gi://Gtk?version=4.0';
import * as ex from './ex'

type MimicDom<T extends Gtk.Widget> = T & {
  _name: string,
  nodeType: number,
  append: (widget: Gtk.Widget | string | number | boolean) => void
  replaceWith: (widget: Gtk.Widget) => void
  remove: () => void
  setAttribute: (name: string, value: any) => void
  removeEventListener: (event: string, callback: any) => void
  addEventListener: (event: string, callback: any) => void
  isConnected: boolean
}

(globalThis as any).Text = function Text(text: any) {
  if (text == null) {
    return null
  }
  const label = new Gtk.Label({ label: String(text) })
  return wrapWidget(label, "Label")
}

function replaceWith(box: Gtk.Widget,
  newWidget: Gtk.Widget, oldWidget: Gtk.Widget
) {
  let child = box.get_first_child()
  let prev = child
  while (child != null && child !== oldWidget) {
    prev = child
    child = child.get_next_sibling();
  }

  newWidget.insert_after(box, prev)
  oldWidget.unparent();
}

function singleChildContainerReplaceWith<T extends { child: Gtk.Widget }>(container: T, newWidget: Gtk.Widget, oldWidget: Gtk.Widget) {
  oldWidget.unparent();
  container.child = newWidget
}

const replace = {
  'Box': replaceWith,
  'ListBox': replaceWith,
  'ListBoxRow': singleChildContainerReplaceWith<Gtk.ListBoxRow>,
  'ScrolledWindow': singleChildContainerReplaceWith<Gtk.ScrolledWindow>,
  'Revealer': singleChildContainerReplaceWith<Gtk.Revealer>,
  'StackPage': singleChildContainerReplaceWith<Gtk.StackPage>,
  'Stack': replaceWith,
  'FlowBox': replaceWith,
  'Fixed': replaceWith,
}
function singleChildContainerAppend<T extends { child: Gtk.Widget }>(container: T, child: Gtk.Widget) {
  container.child = child
}
const appendFns = {
  'ListBoxRow': singleChildContainerAppend<Gtk.ListBoxRow>,
  'ScrolledWindow': singleChildContainerAppend<Gtk.ScrolledWindow>,
  'Revealer': singleChildContainerAppend<Gtk.Revealer>,
  'StackPage': singleChildContainerAppend<Gtk.StackPage>,
  'Stack': (container: Gtk.Stack, child: Gtk.Widget) => {
    const _stackMeta = ex.get(child) as { name: string, title?: string }
    if (_stackMeta.title) {
      container.add_titled(child, _stackMeta.name, _stackMeta.title)
    } else {
      container.add_named(child, _stackMeta.name)
    }
  },
  'Notebook': (container: Gtk.Notebook, child: Gtk.Widget) => {
    const title = ex.get(child)
    if (title) {
      container.append_page(child, title)
    }
    //TODO: error
  },
  'Fixed': (container: Gtk.Fixed, child: Gtk.Widget) => {
    const { x, y } = ex.get(child) ?? { x: 0, y: 0 }
    container.put(child, x, y)
  }
}

function wrapWidget<T extends Gtk.Widget>(
  widget: T,
  name: string
): MimicDom<T> {
  const listeners = new WeakMap();
  const append = (widget as any).append as (null | ((child: Gtk.Widget) => void))
  const w: MimicDom<T> = widget as any
  w._name = name;
  w.nodeType = 1
  w.remove = function () {
    widget.unparent();
  }
  w.replaceWith = function (newWidget: Gtk.Widget) {
    const parent = widget.parent
    replace[parent._name as keyof typeof replace]?.(parent, newWidget, widget)
  }
  w.setAttribute = function (name: string, value: any) {
    console.log("name:", name, value);
    try {
      (widget as any)[`set_${name}`](value)
    } catch (e) {
      console.error(e)
    }
    // widget.set({
    //   name: value
    // })
  }
  w.append = function (child: Gtk.Widget | string | number | boolean) {
    if (append == null && appendFns[name as keyof typeof appendFns] == null) return
    const childWidget = typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean'
      ? new Gtk.Label({ label: String(child) }) : child
    if (append) {
      append.call(widget, childWidget)
    } else {
      appendFns[name as keyof typeof appendFns]?.(widget, childWidget)
    }
  }
  w.addEventListener =
    function (event: string, callback: any) {
      const id = widget.connect(event, callback)
      listeners.set(callback, id)
    };
  w.removeEventListener =
    function (event: string, callback: any) {
      if (callback) {
        widget.disconnect(listeners.get(callback))
      }
    };
  Object.defineProperty(w, 'isConnected', {
    get: function () {
      return w.parent != null
    }
  })
  return w
}


(globalThis as any).document = {
  nodeType: 1,
  createElement: function (
    tagName: string) {
    const widget = new (Gtk as any)[tagName]({})
    return wrapWidget(widget, tagName)
  }
}
