
import Gtk from 'gi://Gtk?version=4.0';

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
  if(text == null) {
    return null
  }
  const label = new Gtk.Label({ label: String(text) })
  return wrapWidget(label, "Label")
}

const replace = {
  'Box': (box: Gtk.Box, newWidget: Gtk.Widget, oldWidget: Gtk.Widget) => {
    let child = box.get_first_child()
    let prev = child
    while (child != null && child !== oldWidget) {
      prev = child
      child = child.get_next_sibling();
    }
    oldWidget.unparent();
    box.insert_child_after(newWidget, prev);
  }
}
const appendFns: Record<string, (widget: Gtk.Widget, child: Gtk.Widget) => void> = {
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

  return Object.assign(widget, {
    _name: name,
    nodeType: 1,
    append: function (child: Gtk.Widget | string | number | boolean) {
      if (append == null && appendFns[name as keyof typeof appendFns] == null) return
      const childWidget = typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean'
        ? new Gtk.Label({ label: String(child) }) : child
      if (append) {
        append.call(widget, childWidget)
      } else {
        appendFns[name as keyof typeof appendFns]?.(widget, childWidget)
      }
    },
    replaceWith: function (newOne: Gtk.Widget) {
      const parent = widget.parent as MimicDom<Gtk.Widget>
      replace[parent._name as keyof typeof replace]?.(parent as any, newOne, widget)
    },
    remove: function () {
      widget.unparent();
    },
    setAttribute: function (name: string, value: any) {
      (widget as any)[`set${name.charAt(0).toUpperCase() + name.slice(1)}`](value)
    },
    removeEventListener:
      function (event: string, callback: any) {
        if (callback) {
          widget.disconnect(listeners.get(callback))
        }
      },
    addEventListener:
      function (event: string, callback: any) {
        console.log("connect:", event)
        const id = widget.connect(event, callback)
        listeners.set(callback, id)
      },
    get isConnected() {
      return widget.parent != null
    }
  })
}


(globalThis as any).document = {
  nodeType: 1,
  createElement: function (
    tagName: string) {
    const widget = new (Gtk as any)[tagName]({})
    return wrapWidget(widget, tagName)
  }
}
